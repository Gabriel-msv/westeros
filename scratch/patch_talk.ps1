# Script para substituir a função talk() em game.js adicionando chamada ao sistema de diálogos
$file = 'js\game.js'
$lines = [System.IO.File]::ReadAllLines($file, [System.Text.Encoding]::UTF8)

# Encontra a linha com "function talk()"
$start = -1
$end = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match 'function talk\(\)') {
        $start = $i - 1  # a linha anterior é o comentário
        break
    }
}

if ($start -lt 0) {
    Write-Host "Não encontrou function talk()"
    exit 1
}

# Encontra onde termina (primeira linha com "return 0}")
for ($i = $start; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match 'return 0\}') {
        $end = $i
        break
    }
}

Write-Host "talk() encontrada nas linhas $($start+1) a $($end+1)"

# Nova versão da função talk() com sistema de diálogos
$newLines = @(
'/** Interage com o NPC adjacente (abre loja/estalagem ou fala com o guardião do portão). Devolve 1 se tratou. */',
'function talk(){const n=NP.find(n=>Math.max(Math.abs(n.x-P.x),Math.abs(n.y-P.y))<=1);',
' if(n){',
'  if(n.k==''gate''){',
'   if(P.lvl<20){msg(''Patrulheiro do Portão: "Só pode passar quando for mais forte.\"'',''#ffd24a'')}',
'   else{msg(''Patrulheiro do Portão: "Pode passar, irmão.\"'',''#8fd0f0'')}',
'   return 1;',
'  }',
'  const rp=P.rp[n.ti]||0;',
'  if(rp<=-50){msg(n.n+'' se recusa a falar com você.'',''#ff8a80'');return 1}',
'  if(typeof npcDialog===''function''){',
'   const linha=npcDialog(n.k,rp,P.name,TW[n.ti]?TW[n.ti].n:''aqui'',P.lvl);',
'   if(linha)msg(n.n+'': <em style="color:#e8d8b0">&ldquo;''+linha+''&rdquo;</em>'',''#e8d8b0'');',
'  }',
'  S=n;shop();return 1}',
' return 0}'
)

# Reconstrói o array substituindo as linhas
$before = $lines[0..($start-1)]
$after  = $lines[($end+1)..($lines.Length-1)]
$result = $before + $newLines + $after

[System.IO.File]::WriteAllLines($file, $result, [System.Text.Encoding]::UTF8)
Write-Host "Arquivo atualizado com sucesso. Total de linhas: $($result.Length)"
