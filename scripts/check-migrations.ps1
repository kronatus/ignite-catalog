# Run from project root in PowerShell.
# Usage: 
#   $env:DATABASE_URL = "postgresql://..." ; .\scripts\check-migrations.ps1

if (-not $env:DATABASE_URL) {
  Write-Error "DATABASE_URL environment variable is not set. Set it first and re-run."
  exit 1
}

Write-Host "Running: npx prisma generate"
$npx = Start-Process -FilePath "npx" -ArgumentList "prisma generate" -NoNewWindow -Wait -PassThru
if ($npx.ExitCode -ne 0) {
  Write-Error "prisma generate failed with exit code $($npx.ExitCode)."
  exit $npx.ExitCode
}

Write-Host "Running: node .\scripts\check-migrations.js"
$node = Start-Process -FilePath "node" -ArgumentList ".\scripts\check-migrations.js" -NoNewWindow -Wait -PassThru
if ($node.ExitCode -ne 0) {
  Write-Error "check-migrations script failed with exit code $($node.ExitCode)."
  exit $node.ExitCode
}

Write-Host "Done."