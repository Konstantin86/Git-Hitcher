﻿Param(
    [string][Parameter(Mandatory=$true)] $WebSiteName,
    [string] $ResourceGroupName = $WebSiteName,
    [string] $StorageAccountName = $ResourceGroupName.ToLowerInvariant() + "storage",
    [string] $StorageAccountNameTest = $ResourceGroupName.ToLowerInvariant() + "test",
    [string] $ResourceGroupLocation = "West Europe",
    [string] $StorageContainerName = $WebSiteName.ToLowerInvariant(),
    [string] $TemplateFile = '.\Templates\WebSiteSharedDeploySQL.json'
)

$ErrorActionPreference = "Stop";

$TemplateFile = [System.IO.Path]::Combine($PSScriptRoot, $TemplateFile);

#Define SQL server
$sqlServerName = $WebSiteName.toLowerInvariant() + "server";
$sqlDbName = $WebSiteName.toLowerInvariant() + "db";
$sqlServerAdminLogin = $WebSiteName.toLowerInvariant() + "DbAdmin"
#$plainTextPassword = "P{0}!" -f ([System.Guid]::NewGuid()).Guid.Replace("-", "").Substring(0, 10);
$plainTextPassword = "1208Skpi5";
$sqlServerAdminPassword = ConvertTo-SecureString $plainTextPassword -AsPlainText -Force

Switch-AzureMode AzureResourceManager;

$VerbosePreference = "Continue";
New-AzureResourceGroup -Name $ResourceGroupName `
                       -Location $ResourceGroupLocation `
                       -TemplateFile $TemplateFile `
                       -sqlServerName $sqlServerName `
                       -sqlServerLocation $ResourceGroupLocation `
                       -sqlServerAdminLogin $sqlServerAdminLogin `
                       -sqlServerAdminPassword $sqlServerAdminPassword `
                       -sqlDbName $sqlDbName `
                       -webSiteName $webSiteName `
                       -webSiteLocation $ResourceGroupLocation `
                       -webSiteHostingPlanName "SharedPlan" `
                       -webSiteHostingPlanSKU "Shared" `
                       -sqlDbEdition "Standard" `
					   -storageAccountNameFromTemplate $StorageAccountName `
                       -Force `
					   -Verbose;
#Azure service object id - performance levels (https://msdn.microsoft.com/en-US/library/azure/dn505701)


#Configure storage:
#Add container for storing app-specific blobs
Set-AzureSubscription -CurrentStorageAccountName $StorageAccountName -SubscriptionName (Get-AzureSubscription -current).SubscriptionName;
New-AzureStorageContainer -Name ($WebSiteName.ToLowerInvariant() + "media") -Permission Container;

Switch-AzureMode -Name AzureServiceManagement;

#Configure web app:
#Enable web-sockets
Set-AzureWebsite $WebSiteName -WebSocketsEnabled $true;
#http://blogs.msdn.com/b/cdndevs/archive/2015/04/23/azure-powershell-azure-websites-for-the-command-line-junkies-part-1.aspx
#configure custom domains
#Set-AzureWebsite -Name "ramisample" -HostNames @('www.abc.com', 'abc.com')
#http://stackoverflow.com/questions/21036060/add-many-domains-to-an-azure-web-site

#Configure sql
#Set correct sql edition (standard)
#Add current machine ip to firewall (optional)

