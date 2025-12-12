$base = 'https://ignite-catalog.vercel.app/api/ingest-reinvent'
$batch = 500
$start = 0
$totalCreated = 0
$totalUpdated = 0

while ($true) {
  $url = "$base`?start=$start&batchSize=$batch"
  Write-Host "Calling $url"
  try {
    $resp = Invoke-RestMethod -Uri $url -Method POST -TimeoutSec 300
  } catch {
    Write-Warning "Request failed: $($_.Exception.Message) - retrying in 5s"
    Start-Sleep -Seconds 5
    continue
  }
  Write-Host ($resp | ConvertTo-Json -Depth 3)
  $totalCreated += $resp.created
  $totalUpdated += $resp.updated
  if ($resp.finished -eq $true -or $resp.nextStart -eq $null) {
    Write-Host "Ingest finished. Total created: $totalCreated, Total updated: $totalUpdated"
    break
  }
  $start = $resp.nextStart
  Write-Host "Waiting 2s before next batch..."
  Start-Sleep -Seconds 2
}
