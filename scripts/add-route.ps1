$env:USERPROFILE = 'C:\myproject\invest-hub\.home'
$env:HOME = 'C:\myproject\invest-hub\.home'
$json = [System.IO.File]::ReadAllText('C:\myproject\invest-hub\scripts\routes-add.json')
Write-Output ('JSON-LEN=' + $json.Length)
& tcb routes add -e 'ceshi-1-d1g0czdaa999081f4' --data $json
