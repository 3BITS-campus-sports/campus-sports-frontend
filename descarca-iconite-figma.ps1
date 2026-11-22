# Descarca iconitele din prototipul Figma in src/assets/figma.
# Ruleaza din folderul campus-sports-frontend:  powershell -ExecutionPolicy Bypass -File .\descarca-iconite-figma.ps1
# Linkurile sunt temporare: pasul 1 expira pe 27.11.2026, pasul 2 pe 28.11.2026.
$ErrorActionPreference = 'Stop'
$dest = Join-Path $PSScriptRoot 'src\assets\figma'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$iconite = [ordered]@{
  'decor-hero-1.svg'   = 'https://www.figma.com/api/mcp/asset/a11db9f3-a584-42d6-a20f-4d7bc73b68e5.svg'
  'decor-hero-2.svg'   = 'https://www.figma.com/api/mcp/asset/fe727f4a-fadf-4d56-83ee-7495fd249d55.svg'
  'logo-ball.svg'      = 'https://www.figma.com/api/mcp/asset/8af97642-3ef4-42c2-83eb-f56577c129fc.svg'
  'icon-search.svg'    = 'https://www.figma.com/api/mcp/asset/d1718648-849b-45be-b8e2-fcace79a0201.svg'
  'icon-map-white.svg' = 'https://www.figma.com/api/mcp/asset/a68a147f-bdea-438c-b0dd-f5e9dba674e1.svg'
  'decor-card.svg'     = 'https://www.figma.com/api/mcp/asset/43bed453-f87e-4a63-8108-b592c2eaa942.svg'
  'icon-waves.svg'     = 'https://www.figma.com/api/mcp/asset/199e565c-3853-4874-9772-91de3143a338.svg'
  'icon-tag.svg'       = 'https://www.figma.com/api/mcp/asset/e6befaef-ba0e-4d1e-b302-0e1f17ea9b70.svg'
  'dot-open.svg'       = 'https://www.figma.com/api/mcp/asset/6130252a-a85e-4d3f-86fc-01626ddce57c.svg'
  'icon-arrow-white.svg' = 'https://www.figma.com/api/mcp/asset/c053bfb3-8569-49ba-bae0-fed3d464b56e.svg'
  'icon-flame.svg'     = 'https://www.figma.com/api/mcp/asset/5f5f2822-e561-4ccb-919e-6b16642659a7.svg'
  'icon-ball-card.svg' = 'https://www.figma.com/api/mcp/asset/c5f993b9-5f90-4cd8-9a00-88473573bfd6.svg'
  'nav-grid.svg'       = 'https://www.figma.com/api/mcp/asset/ab96b565-df68-453c-a380-5b1a35d92176.svg'
  'nav-map.svg'        = 'https://www.figma.com/api/mcp/asset/6ae18f38-562c-413e-8921-7801b5a460af.svg'
  'nav-calendar.svg'   = 'https://www.figma.com/api/mcp/asset/1d13a551-2d0b-450d-8fe0-806617d65902.svg'
  'nav-user.svg'       = 'https://www.figma.com/api/mcp/asset/e090fb44-3d95-4d8b-aeaa-b71f9a459f2b.svg'
  # Pasul 2: Autentificare si Creare cont
  'icon-arrow-dark.svg' = 'https://www.figma.com/api/mcp/asset/6df6229e-103c-423a-a44a-973e3bd2ffcd.svg'
  'icon-lock.svg'      = 'https://www.figma.com/api/mcp/asset/991d8b1b-7b76-4f3b-bc52-40e0b45bf9d0.svg'
  'icon-check.svg'     = 'https://www.figma.com/api/mcp/asset/d977e63e-e464-41be-a846-78ba4869d630.svg'
  'icon-info-red.svg'  = 'https://www.figma.com/api/mcp/asset/92bbe240-3d20-4049-b107-4ff6efd6c215.svg'
}

foreach ($nume in $iconite.Keys) {
  $fisier = Join-Path $dest $nume
  Invoke-WebRequest -Uri $iconite[$nume] -OutFile $fisier -UseBasicParsing
  $marime = (Get-Item $fisier).Length
  if ($marime -eq 0) { throw "Fisierul $nume este gol." }
  Write-Host ("OK  {0,-22} {1} octeti" -f $nume, $marime)
}
Write-Host "Gata: $($iconite.Count) iconite in $dest"
