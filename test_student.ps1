$body = @'
{
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "parentFirstName": "Jane",
    "parentLastName": "Doe",
    "parentEmail": "jane.doe@example.com",
    "parentPhone": "+1987654321",
    "address": "123 Main St, City, State 12345"
}
'@

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/student/new' -Method POST -ContentType 'application/json' -Body $body
    Write-Host "Success: $response"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}