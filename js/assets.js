const WATER_MS=1000,ASSET_MANIFEST=Object.create(null),TX=Object.create(null);
const asset=(name,path)=>{ASSET_MANIFEST[name]='assets/westeros/'+path};

[
 ['agua','aguas/agua.png'],['agua1','aguas/agua1.png'],['agua2','aguas/agua2.png'],
 ['areia','areias/areia.png'],['areia2','areias/areia2.png'],['areiadeserto','areias/areiadeserto.png'],
 ['arbusto','arvores/arbusto.png'],['cacto','arvores/cacto.png'],['carvalho','arvores/carvalho.png'],['palmeira','arvores/palmeira.png'],['pinheiro','arvores/pinheiro.png'],
 ['báu','cidade/báu.png'],['bau','cidade/báu.png'],['palA','cidade/paralelepipedoalternativo.png'],['palN','cidade/paralelepipedonormal.png'],['pedregulho','cidade/pedregulho.png'],['porta','cidade/porta.png'],['porto','cidade/porto.png'],['tabuas','cidade/tabuas.png'],['telhas','cidade/telhas.png'],['tijolom','cidade/tijolo marrom.png'],['tijolo','cidade/tijolo.png'],['tijolon','cidade/tijolonegro.png'],
 ['estrada','gramas/estrada .png'],['grama','gramas/grama.png'],['grama2','gramas/grama2.png'],['grama3','gramas/grama3.png'],['neve','gramas/neve.png'],
 ['minério','pedras/minério.png'],['minerio','pedras/minério.png'],['montanha','pedras/montanha.png'],
 ['baratheon','vivos/player/baratheon.png'],['lennister','vivos/player/lennister.png'],['stark','vivos/player/stark.png'],['targeryan','vivos/player/targeryan.png']
].forEach(([name,path])=>asset(name,path));
for(const direction of ['N','S','L','R'])asset(`barco_${direction}`,`veiculos/barco_${direction}.png`);

[
 ['item_potion','itens/consumiveis/pocao.png'],['item_meat','itens/consumiveis/carne.png'],['item_fish','itens/consumiveis/peixe.png'],
 ['item_wood','itens/recursos/madeira.png'],['item_iron','itens/recursos/minerio_ferro.png'],['item_copper','itens/recursos/minerio_cobre.png'],['item_silver','itens/recursos/minerio_prata.png'],['item_wolf_pelt','itens/recursos/pele_lobo.png'],['item_bear_pelt','itens/recursos/pele_urso.png'],['item_mammoth_tusk','itens/recursos/presa_mamute.png'],['item_giant_bone','itens/recursos/osso_gigante.png'],['item_cursed_bone','itens/recursos/osso_amaldicoado.png'],['item_wheat','itens/recursos/trigo.png'],['item_blue_flower','itens/recursos/flor_azul.png'],
 ['item_antique_relic','itens/raros/reliquia_antiga.png'],['item_dragonglass','itens/raros/vidro_dragao.png'],['item_dragon_scale','itens/raros/escama_dragao.png'],['item_ice','itens/raros/coracao_gelado.png'],['item_gold_coin','itens/raros/moeda_ouro.png'],['item_arrow','itens/raros/flecha.png'],
 ['item_fists','itens/armas/punhos/punhos.png'],['item_dagger','itens/armas/adaga/adaga.png'],['item_long_sword','itens/armas/espada_longa/espada_longa.png'],['item_steel_sword','itens/armas/espada_aco/espada_aco.png'],['item_valyrian_steel','itens/armas/aco_valiriano/aco_valiriano.png'],
 ['item_clothes','itens/armaduras/roupas.png'],['item_leather_armor','itens/armaduras/gibao_couro.png'],['item_chainmail','itens/armaduras/cota_malha.png'],['item_plate_armor','itens/armaduras/armadura_placas.png'],['item_valyrian_armor','itens/armaduras/armadura_valiriana.png'],
 ['item_leather_hood','itens/capacetes/capuz_couro.png'],['item_iron_helmet','itens/capacetes/elmo_ferro.png'],['item_wooden_shield','itens/escudos/escudo_madeira.png'],['item_iron_shield','itens/escudos/escudo_ferro.png'],
 ['item_axe','itens/ferramentas/machado/machado_n1.png'],['item_pickaxe','itens/ferramentas/picareta/picareta_n1.png'],['item_fishing_rod','itens/ferramentas/vara_pesca/vara_pesca_n1.png']
].forEach(([name,path])=>asset(name,path));
for(const [name,folder,file]of[['axe','machado','machado'],['pickaxe','picareta','picareta'],['fishing_rod','vara_pesca','vara_pesca']]){
 for(let level=1;level<=3;level++)for(const hand of['L','R'])asset(`held_${name}_${level}_${hand}`,`itens/ferramentas/${folder}/${file}_n${level}_${hand}.png`);
 for(let level=1;level<=3;level++)asset(`inventory_${name}_${level}`,`itens/ferramentas/${folder}/${file}_n${level}.png`);
}

const regions=['campo','dorne','norte'],genders=['m','f'];
const npcFolders={campones:'01_campones',soldado:'02_soldado',guarda:'03_guarda',mercador:'04_mercador',taverneiro:'05_taverneiro',mendigo:'06_mendigo',ferreiro:'07_ferreiro',sacerdote:'08_sacerdote',maester:'09_maester',prostituta:'10_prostituta',carpinteiro:'11_carpinteiro',viajante:'12_viajante'};
for(const [name,folder]of Object.entries(npcFolders))for(const region of regions)for(const gender of genders)asset(`${name}_${gender}_${region}`,`vivos/npc/${folder}/${region}/${name}_${gender}_${region}.png`);

for(const region of regions){
 asset(`renegado_${region}`,`vivos/inimigos_westeros/humanos/renegado/${region}/renegado_${region}.png`);
 asset(`criminoso_${region}`,`vivos/inimigos_westeros/humanos/criminoso/${region}/criminoso_${region}.png`);
 asset(`montanhes_${region}`,`vivos/inimigos_westeros/humanos/montanhes/${region}/montanhes_${region}.png`);
 asset(`zumbi_1_campones_${region}`,`vivos/inimigos_westeros/mortos_vivos/zumbi_1_campones/${region}/zumbi_1_campones_${region}.png`);
 asset(`zumbi_2_aldea_${region}`,`vivos/inimigos_westeros/mortos_vivos/zumbi_2_aldea/${region}/zumbi_2_aldea_${region}.png`);
 asset(`zumbi_3_soldado_${region}`,`vivos/inimigos_westeros/mortos_vivos/zumbi_3_soldado/${region}/zumbi_3_soldado_${region}.png`);
 asset(`zumbi_4_nobre_${region}`,`vivos/inimigos_westeros/mortos_vivos/zumbi_4_nobre/${region}/zumbi_4_nobre_${region}.png`);
 asset(`zumbi_5_sacerdote_${region}`,`vivos/inimigos_westeros/mortos_vivos/zumbi_5_sacerdote/${region}/zumbi_5_sacerdote_${region}.png`);
}
asset('selvagem_norte','vivos/inimigos_westeros/humanos/selvagem/norte/selvagem_norte.png');
asset('caminhante_branco_norte','vivos/inimigos_westeros/mortos_vivos/caminhante_branco/norte/caminhante_branco_norte.png');
for(const name of ['lobo_gigante','urso_gigante','mamute'])for(const direction of ['esq','dir']){
 const folder=name==='lobo_gigante'?'lobo_gigante_64x64':name;
 asset(`${name}_${direction}`,`vivos/inimigos_westeros/animais_grandes_64x64/${folder}/${name}_${direction}.png`);
}
asset('gigante','vivos/inimigos_westeros/gigantes_64x64/gigante/gigante.png');
asset('gigante_zumbi_norte','vivos/inimigos_westeros/gigantes_64x64/gigante_zumbi/norte/gigante_zumbi_norte.png');
for(const name of ['lobo','urso','auroque','gato_das_sombras','javali','lagarto_leao'])for(const direction of ['esq','dir']){
 const folder=name==='lobo'?'lobo_32x32':name;
 asset(`${name}_${direction}`,`vivos/inimigos_westeros/animais_pequenos_32x32/${folder}/${name}_${direction}.png`);
}

function TXload(name,path){const image=new Image();image.decoding='async';image.onerror=()=>console.warn('Imagem ausente:',path);image.src=encodeURI(path);TX[name]=image;return image}
Object.entries(ASSET_MANIFEST).forEach(([name,path])=>TXload(name,path));
