Param(
    [string][Parameter(Mandatory=$true)] $WebSiteName,
	[string][Parameter(Mandatory=$true)] $StorageContainerName,
	[string] $ResourceGroupName = $WebSiteName,
	[string] $StorageAccountName = $ResourceGroupName.ToLowerInvariant() + "storage",
	[string] $webSitePackage = "CustomerManager.zip",
    [string] $TemplateFile = '.\Templates\PublishWebApp.json'
)

$ErrorActionPreference = "Stop";
$wasServiceManagementMode = Get-Module -Name Azure -ListAvailable;

$TemplateFile = [System.IO.Path]::Combine($PSScriptRoot, $TemplateFile);
	
Switch-AzureMode -Name AzureServiceManagement;
$storageAccountKey = (Get-AzureStorageKey -StorageAccountName $StorageAccountName).Primary;
$storageAccountContext = New-AzureStorageContext $StorageAccountName $storageAccountKey;
$dropLocation = $storageAccountContext.BlobEndPoint + $StorageContainerName;
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