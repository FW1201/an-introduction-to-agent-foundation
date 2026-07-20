$ErrorActionPreference = "Continue"
Write-Output "Agent Foundation bootstrap check (Windows)"

foreach ($tool in @("winget", "git", "node", "npm", "npx", "gh", "officecli", "python")) {
  $command = Get-Command $tool -ErrorAction SilentlyContinue
  if ($null -ne $command) {
    $version = & $tool --version 2>$null | Select-Object -First 1
    Write-Output "✓ $tool: $version"
  } else {
    Write-Output "○ $tool: not found"
  }
}
Write-Output "Do not install anything until the user confirms the official installation path."
