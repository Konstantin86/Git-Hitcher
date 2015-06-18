Param(
    [string][Parameter(Mandatory=$true)] $WebSiteName,
    [string][ValidateScript({Test-Path $_ -PathType 'Leaf'})] [Parameter(Mandatory=$true)] $ProjectFile,
    [string] $ResourceGroupName = $WebSiteName,
    [string] $StorageAccountName = $ResourceGroupName.ToLowerInvariant() + "storage",
    [string] $StorageContainerName = ("{0}-{1}" -f $WebSiteName.ToLowerInvariant(), (Get-Date -format "hh-mm-ss-dd-mm-yyyy")),
    [string] $StorageContainerMediaName = "smartgomedia",
    [string] $LocalStorageDropPath = 'StorageDrop',
    [string] $LocalStorageMediaDropPath = 'StorageMediaDrop',
    [string] $AzCopyPath = '.\Tools\AzCopy.exe',
    [string] $webSitePackage = "hitcher.zip",
    [string] $TemplateFile = '.\Templates\PublishWebApp.json'
)

$ErrorActionPreference = "Stop";
$wasServiceManagementMode = Get-Module -Name Azure -ListAvailable;

$AzCopyPath = [System.IO.Path]::Combine($PSScriptRoot, $AzCopyPath);
$TemplateFile = [System.IO.Path]::Combine($PSScriptRoot, $TemplateFile);
$LocalStorageDropPath = [System.IO.Path]::Combine($PSScriptRoot, $LocalStorageDropPath);
$LocalStorageMediaDropPath = [System.IO.Path]::Combine($PSScriptRoot, $LocalStorageMediaDropPath);

if(!(Test-Path -PathType Container $LocalStorageDropPath)) { mkdir $LocalStorageDropPath; }

#Local Drop Cleanup
Remove-Item ($LocalStorageDropPath + '\*');

#Publish to Local Drop
$publishXmlFile = ".\WebDeployPackage.pubxml";
& "$env:windir\Microsoft.NET\Framework\v4.0.30319\MSBuild.exe" $ProjectFile `
    /p:VisualStudioVersion=12.0 `
    /p:DeployOnBuild=true `
    /p:DesktopBuildPackageLocation=$LocalStorageDropPath `
    /p:PublishProfile=WebDeployPackage.pubxml `
    /p:Configuration=WebDeployPackage;

    #Apparently, for the transform to be executed, you have to specify a build configuration using:
    #/p:Configuration=WebDeployPackage

	
Switch-AzureMode -Name AzureServiceManagement;
#Copy application package to the storage
$storageAccountKey = (Get-AzureStorageKey -StorageAccountName $StorageAccountName).Primary;
$storageAccountContext = New-AzureStorageContext $StorageAccountName $storageAccountKey;
$dropLocation = $storageAccountContext.BlobEndPoint + $StorageContainerName;
$dropMediaLocation = $storageAccountContext.BlobEndPoint + $StorageContainerMediaName;
& $AzCopyPath $LocalStorageDropPath $dropLocation /DestKey:$storageAccountKey /S /Y;
& $AzCopyPath $LocalStorageMediaDropPath $dropMediaLocation /DestKey:$storageAccountKey /S /Y;

#Upload media app blobs to azure (default avatar and icons):
#http://irisclasson.com/2014/05/07/creating-and-uploading-to-azure-blob-storage-with-azure-powershell/

#Set drop location for msdeploy
$dropLocationSasToken = New-AzureStorageContainerSASToken -Container $StorageContainerName -Context $storageAccountContext -Permission r;
$dropLocationSasToken = ConvertTo-SecureString $dropLocationSasToken -AsPlainText -Force;

Switch-AzureMode AzureResourceManager;

$ResourceGroupLocation = (Get-AzureResourceGroup -Name $ResourceGroupName).Location;
New-AzureResourceGroup -Name $ResourceGroupName `
                       -Location $ResourceGroupLocation `
                       -TemplateFile $TemplateFile `
                       -webSiteName $webSiteName `
                       -dropLocation $dropLocation `
                       -dropLocationSasToken $dropLocationSasToken `
					   -webSitePackage $webSitePackage `
                       -Force `
					   -Verbose;

# Switch back to original mode before exiting 
if ($wasServiceManagementMode) {  
    Switch-AzureMode AzureServiceManagement 
}