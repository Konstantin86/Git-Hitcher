Param(
    [string][Parameter(Mandatory=$true)] $WebSiteName,
    [string][ValidateScript({Test-Path $_ -PathType 'Leaf'})] [Parameter(Mandatory=$true)] $ProjectFile,
    #[string] $ResourceGroupName = $WebSiteName,
    #[string] $StorageAccountName = $ResourceGroupName.ToLowerInvariant() + "storage",
    #[string] $ResourceGroupLocation = "West Europe",
    [string] $StorageContainerName = $WebSiteName.ToLowerInvariant(),
    [string] $TemplateFile = '.\Templates\WebApp.json',
    [string] $LocalStorageDropPath = '.\StorageDrop',
    [string] $AzCopyPath = '.\Tools\AzCopy.exe'
)

$ErrorActionPreference = "Stop";

[Xml]$envXml = Get-Content $PSScriptRoot\website-publish-environment.xml;
$ResourceGroupName = $envXml.resourceGroup.name;
$ResourceGroupLocation = $envXml.resourceGroup.location;
$StorageAccountName = $envXml.resourceGroup.storage.accountName;
$SqlServerName = $envXml.resourceGroup.sqlAzure.databaseServerName;
$SqlServerAdminLogin = $envXml.resourceGroup.sqlAzure.userName;
$SqlServerAdminPassword = $envXml.resourceGroup.sqlAzure.password;
$SqlDbName = $envXml.resourceGroup.sqlAzure.databaseName;

$AzCopyPath = [System.IO.Path]::Combine($PSScriptRoot, $AzCopyPath);
$TemplateFile = [System.IO.Path]::Combine($PSScriptRoot, $TemplateFile);
$LocalStorageDropPath = [System.IO.Path]::Combine($PSScriptRoot, $LocalStorageDropPath);

#Build the application
$publishXmlFile = ".\WebDeployPackage.pubxml";

& "$env:windir\Microsoft.NET\Framework\v4.0.30319\MSBuild.exe" $ProjectFile `
    /p:VisualStudioVersion=12.0 `
    /p:DeployOnBuild=true `
    /p:DesktopBuildPackageLocation=$LocalStorageDropPath `
    /p:PublishProfile=WebDeployPackage.pubxml;

Switch-AzureMode -Name AzureServiceManagement;

#Copy application package to the storage
$storageAccountKey = (Get-AzureStorageKey -StorageAccountName $StorageAccountName).Primary
$storageAccountContext = New-AzureStorageContext $StorageAccountName (Get-AzureStorageKey $StorageAccountName).Primary
$dropLocation = $storageAccountContext.BlobEndPoint + $StorageContainerName
& "$AzCopyPath" """$LocalStorageDropPath"" $dropLocation /DestKey:$storageAccountKey /S /Y"

$dropLocationSasToken = New-AzureStorageContainerSASToken -Container $StorageContainerName -Context $storageAccountContext -Permission r 
$dropLocationSasToken = ConvertTo-SecureString $dropLocationSasToken -AsPlainText -Force

$SqlServerAdminPassword = ConvertTo-SecureString $sqlServerAdminPassword -AsPlainText -Force;

Switch-AzureMode AzureResourceManager;

$VerbosePreference = "Continue";
$fqServerDomainName = (Get-AzureResource -Name $sqlServerName `
										 -ResourceGroupName $ResourceGroupName `
										 -ResourceType Microsoft.Sql/servers `
										 -ApiVersion 2014-04-01).Properties.fullyQualifiedDomainName;
New-AzureResourceGroupDeployment -ResourceGroupName $ResourceGroupName `
                       -TemplateFile $TemplateFile `
                       -dropLocation $dropLocation `
                       -dropLocationSasToken $dropLocationSasToken `
                       -fqSqlServerName $fqServerDomainName `
                       -sqlServerAdminLogin $sqlServerAdminLogin `
                       -sqlServerAdminPassword $sqlServerAdminPassword `
                       -sqlDbName $sqlDbName `
                       -webSiteName $webSiteName `
                       -webSiteLocation $ResourceGroupLocation `
                       -webSiteHostingPlanName "FreePlan" `
                       -webSiteHostingPlanSKU "Free" `
                       -webSitePackage "CustomerManager.zip" `
					   -Verbose;
