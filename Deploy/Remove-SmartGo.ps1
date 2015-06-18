. $PSScriptRoot\Account.ps1

Switch-AzureMode AzureResourceManager;
Remove-AzureResourceGroup -Name "smartgo" -Force