#Get Microsoft Active Directory Identity Model
Invoke-WebRequest -Uri 'https://oneget.org/nuget-anycpu-2.8.3.6.exe' -OutFile "${env:Temp}\nuget.exe";
Start-Process -FilePath "${env:Temp}\nuget.exe" -ArgumentList 'install Microsoft.IdentityModel.Clients.ActiveDirectory' -WorkingDirectory $env:Temp;
 
Add-Type -Path "${env:Temp}\Microsoft.IdentityModel.Clients.ActiveDirectory.2.13.112191810\lib\net45\Microsoft.IdentityModel.Clients.ActiveDirectory.dll";

$tenantId = '<<<TENANT_ID_HERE>>>';
$clientId = '<<<CLIENT_ID_HERE>>>';
$subscriptionId = '<<<SUBSCRIPTION_ID_HERE>>>';
 
$authUrl = "https://login.windows.net/${tenantId}";
 
$AuthContext = [Microsoft.IdentityModel.Clients.ActiveDirectory.AuthenticationContext] $authUrl;
 
$result = $AuthContext.AcquireToken("https://management.core.windows.net/", 
    $clientId, 
    [Uri]"https://localhost", 
    [Microsoft.IdentityModel.Clients.ActiveDirectory.PromptBehavior]::Auto);
 
$authHeader = @{
    'Content-Type' = 'application\json'
    'Authorization' = $result.CreateAuthorizationHeader()
};

$allProviders = (Invoke-RestMethod -Uri "https://management.azure.com/subscriptions/${subscriptionId}/providers?api-version=2014-04-01-preview" `
                                   -Headers $authHeader -Method Get -Verbose).Value;

$providerInfo = (Invoke-RestMethod -Uri "https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.ClassicStorage?api-version=2014-04-01-preview" `
                                   -Headers $authHeader -Method Get -Verbose).Value;