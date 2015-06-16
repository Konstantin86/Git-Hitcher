<#
 # Create account.txt file with the username
 Read-Host -Prompt "Please type the user account name in your subscription to use" | Out-File .\account.txt

 # Create PWD File with this command: 
 Read-Host -Prompt "Password" -AsSecureString | ConvertFrom-SecureString | out-file ($env:USERPROFILE + "\pwdfile.txt")

#>

if(!(Test-Path  ($PSScriptRoot + "\account.txt")) )
{
   throw "File account.txt not found"
}

$username = Get-Content ($PSScriptRoot + "\account.txt")

$plainTextPassword = "1208Skpi3";
$password = ConvertTo-SecureString $plainTextPassword -AsPlainText -Force

Write-Host "Connecting as $username..."

$deploymentCreds = New-Object System.Management.Automation.PSCredential($username, $password);

$account = Add-AzureAccount -Credential $deploymentCreds

Write-Output "Selecting subscription..."
$subscription = Get-AzureSubscription | Where TenantId -eq $account.Tenants

Select-AzureSubscription -SubscriptionId $subscription[0].SubscriptionId -Current
Set-AzureSubscription -SubscriptionId $subscription[0].SubscriptionId

