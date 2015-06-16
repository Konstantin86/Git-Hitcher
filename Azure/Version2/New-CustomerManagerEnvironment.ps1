Param(
    [string] [Parameter(Mandatory=$true)]$ResourceGroupName,
    [string] $StorageAccountName = $ResourceGroupName.ToLowerInvariant() + "storage",
    [string] $ResourceGroupLocation = "West Europe",
    [string] $TemplateFile = '.\Templates\StorageSql.json'
)

$VerbosePreference = "Continue";
$ErrorActionPreference = "Stop";

#Define sql server
$sqlServerName = $ResourceGroupName.ToLowerInvariant() + "server";
$sqlDbName = "dmres1";
$sqlServerAdminLogin = "userDB";
#$plainTextPassword = "P{0}!" -f ([System.Guid]::NewGuid()).Guid.Replace("-", "").Substring(0, 10);
$plainTextPassword = "Qwerty11";
$sqlServerAdminPassword = ConvertTo-SecureString $plainTextPassword -AsPlainText -Force;

Switch-AzureMode AzureResourceManager;

#Create azure resource group with storage, SQL server and SQL database
$newResourceGroup = New-AzureResourceGroup -Name $ResourceGroupName `
                       -Location $ResourceGroupLocation `
                       -TemplateFile $TemplateFile `
                       -sqlServerName $sqlServerName `
                       -sqlServerLocation $ResourceGroupLocation `
                       -sqlServerAdminLogin $sqlServerAdminLogin `
                       -sqlServerAdminPassword $sqlServerAdminPassword `
                       -sqlDbName $sqlDbName `
                       -storageAccountNameFromTemplate $StorageAccountName `
                       -Force -Verbose;

#Create XML file with all required configuration for further website deployment
[String]$template = Get-Content $PSScriptRoot\environment-info.tpl;
$xml = $template -f $ResourceGroupName, $ResourceGroupLocation, $StorageAccountName, `
					$sqlServerName, $sqlDbName, $sqlServerAdminLogin, $plainTextPassword;
$xml | Out-File -Encoding utf8 -FilePath $PSScriptRoot\website-publish-environment.xml;