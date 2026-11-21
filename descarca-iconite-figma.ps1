# Descarca iconitele din prototipul Figma in src/assets/figma.
# Ruleaza din folderul campus-sports-frontend:  powershell -ExecutionPolicy Bypass -File .\descarca-iconite-figma.ps1
# Linkurile sunt temporare: pasul 1 expira pe 27.11.2026, pasii 2 si 3 (KAN-52) pe 28.11.2026.
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
  # KAN-52: Detalii facilitate si Alege data si ora
  'icon-back-blue.svg'   = 'https://www.figma.com/api/mcp/asset/9eb2d140-e8f7-4c26-8a72-8013f1640b75.svg'
  'icon-map-teal.svg'    = 'https://www.figma.com/api/mcp/asset/2bdf93f8-3568-42ae-ac20-2fd55bcf845b.svg'
  'icon-clock-teal.svg'  = 'https://www.figma.com/api/mcp/asset/51ce08c8-07bf-4e6c-a640-3597d7b87387.svg'
  'icon-tag-orange.svg'  = 'https://www.figma.com/api/mcp/asset/ce02df17-887e-4f8b-987c-a4b832f26ce3.svg'
  'icon-check-green.svg' = 'https://www.figma.com/api/mcp/asset/42caecde-74ff-494f-bc7b-98fda2948434.svg'
  'icon-phone-white.svg' = 'https://www.figma.com/api/mcp/asset/b9c566ef-2dc2-4510-b1d0-eaec04502217.svg'
  'icon-info-dark.svg'   = 'https://www.figma.com/api/mcp/asset/5a7ee8c9-40cf-4223-809d-445502e799a6.svg'
  'icon-chevron-left.svg' = 'https://www.figma.com/api/mcp/asset/34189a96-71cb-4421-9881-0fc2772e272d.svg'
  'icon-chevron-right.svg' = 'https://www.figma.com/api/mcp/asset/fe0937d4-b712-469d-ac18-715c6db8deda.svg'
  'dot-legend-free.svg'  = 'https://www.figma.com/api/mcp/asset/3db82321-90f0-4bf6-9bd7-f1c0f266d844.svg'
  'dot-legend-busy.svg'  = 'https://www.figma.com/api/mcp/asset/9527eeb2-0ead-4953-8366-0a1736a26906.svg'
  'dot-legend-selected.svg' = 'https://www.figma.com/api/mcp/asset/4cf23e95-0925-415b-a82d-d00eea5777d2.svg'
  'dot-slot-free.svg'    = 'https://www.figma.com/api/mcp/asset/ed7553ec-24bb-4636-8af1-336c12e24990.svg'
  'dot-slot-busy.svg'    = 'https://www.figma.com/api/mcp/asset/8fdc19a6-6f02-4ada-a7bd-7f135e9f26fa.svg'
  'dot-slot-selected.svg' = 'https://www.figma.com/api/mcp/asset/cb1dd52d-e788-4e22-a049-a13519a250d4.svg'
  'icon-info-blue.svg'   = 'https://www.figma.com/api/mcp/asset/844a4fe7-7e59-4255-a930-3b261b491676.svg'
  'icon-info-amber.svg'  = 'https://www.figma.com/api/mcp/asset/95f90b49-0ae0-40ab-a38e-8a2861025a38.svg'
  'icon-arrow-muted.svg' = 'https://www.figma.com/api/mcp/asset/22b8ad53-8bab-45a6-8573-04f8a1a80212.svg'
}

foreach ($nume in $iconite.Keys) {
  $fisier = Join-Path $dest $nume
  Invoke-WebRequest -Uri $iconite[$nume] -OutFile $fisier -UseBasicParsing
  $marime = (Get-Item $fisier).Length
  if ($marime -eq 0) { throw "Fisierul $nume este gol." }
  Write-Host ("OK  {0,-22} {1} octeti" -f $nume, $marime)
}
Write-Host "Gata: $($iconite.Count) iconite in $dest"
