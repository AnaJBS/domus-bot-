const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let estado = 'inicio';
let dados = {};
let encerrado = false;

console.log('- - - - - - - - - - - - - - - - - - - - - - -');
console.log('       DOMUS BOT - Seu assistente virtual');
console.log('- - - - - - - - - - - - - - - - - - - - - - -');
console.log('Escreva uma mensagem para iniciarmos o atendimento.');
console.log('Digite "sair" a qualquer momento para encerrar.\n');

// Função principal
async function processarMensagem(texto) {
  const msg = texto.trim();

  if (!msg) {
    console.log('Domus Bot: Pode escrever, estou aqui para ajudar! 😊');
    return;
  }

  // Comando para encerrar
  if (msg.toLowerCase() === 'sair') {
    console.log('\nDomus Bot: Atendimento encerrado. Obrigado por escolher a Imobiliária Santin!');
    encerrado = true;
    rl.close();
    return;
  }

  switch (estado) {
    case 'inicio':
      mostrarBoasVindas();
      estado = 'pegando_nome';
      console.log('Domus Bot: Para começarmos, qual é o seu nome?');
      break;

    case 'pegando_nome': {
      // VALIDAÇÃO DO NOME
      const nomeValido = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(msg);

      if (!nomeValido) {
        console.log('Domus Bot: Por favor, informe apenas letras no nome');
        console.log('Domus Bot: Qual é o seu nome?');
        return;
      }

      dados.nome = msg;
      console.log(`Domus Bot: Prazer, ${dados.nome}! 😊`);
      console.log(
        'Domus Bot: Como posso te ajudar hoje? Você deseja Aluguel, Venda, Compra ou Consórcio?'
      );
      estado = 'tipo_atendimento';
      break;
    }

    case 'tipo_atendimento':
      definirTipoAtendimento(msg);
      break;

    // ===== FLUXO ALUGUEL =====
    case 'aluguel_tipo_imovel':
      dados.tipo_imovel = msg;
      console.log('Domus Bot: Quantos dormitórios você procura? (ex.: 1, 2, 3...)');
      estado = 'aluguel_dormitorios';
      break;

    case 'aluguel_dormitorios':
      dados.dormitorios = msg;
      console.log('Domus Bot: Em qual bairro você prefere o imóvel para alugar?');
      estado = 'aluguel_bairro';
      break;

    case 'aluguel_bairro':
      dados.bairro = msg;
      console.log('Domus Bot: Você possui filhos? (Responda Sim ou Não)');
      estado = 'aluguel_filhos';
      break;

    case 'aluguel_filhos': {
      const txt = msg.toLowerCase();
      if (txt.startsWith('s')) {
        dados.filhos = 'Sim';
        console.log('Domus Bot: Certo! Qual a idade da criança ou das crianças?');
        estado = 'aluguel_idade_filhos';
      } else if (txt.startsWith('n')) {
        dados.filhos = 'Não';
        dados.idade_filhos = undefined;
        console.log('Domus Bot: Entendi. Você possui pet? (Responda *Sim* ou *Não*)');
        estado = 'aluguel_pet';
      } else {
        console.log('Domus Bot: Me responda apenas *Sim* ou *Não*, por favor 😊');
      }
      break;
    }

    case 'aluguel_idade_filhos':
      dados.idade_filhos = msg;
      console.log('Domus Bot: Obrigado! Agora me conta: você possui pet? (Sim/Não)');
      estado = 'aluguel_pet';
      break;

    case 'aluguel_pet': {
      const txt = msg.toLowerCase();
      if (txt.startsWith('s')) {
        dados.tem_pet = 'Sim';
        console.log(
          'Domus Bot: Perfeito! Quantos são e de que porte? (ex.: "2 pequenos", "1 médio")'
        );
        estado = 'aluguel_pet_detalhes';
      } else if (txt.startsWith('n')) {
        dados.tem_pet = 'Não';
        dados.info_pet = undefined;

        // 👉 NOVO PASSO: FORMAS DE LOCAÇÃO (MENU NUMÉRICO)
        mostrarMenuGarantia();
        estado = 'aluguel_garantia';
      } else {
        console.log('Domus Bot: Me responda apenas *Sim* ou *Não*, por favor 😊');
      }
      break;
    }

    case 'aluguel_pet_detalhes':
      dados.info_pet = msg;

      // 👉 NOVO PASSO: FORMAS DE LOCAÇÃO (MENU NUMÉRICO)
      mostrarMenuGarantia();
      estado = 'aluguel_garantia';
      break;

    // 👉 ESTADO PARA A ESCOLHA DA GARANTIA (COM NÚMEROS 1, 2, 3)
    case 'aluguel_garantia': {
      const opcao = msg.trim();

      if (opcao === '1') {
        dados.forma_locacao = 'Um fiador com dois bens imóveis';
      } else if (opcao === '2') {
        dados.forma_locacao = 'Dois fiadores com um bem imóvel cada um';
      } else if (opcao === '3') {
        dados.forma_locacao = 'CredPago';
      } else {
        console.log('Domus Bot: Opção inválida. Por favor, escolha 1, 2 ou 3. 😊');
        mostrarMenuGarantia();
        return; // fica no mesmo estado
      }

      finalizarAtendimento();
      break;
    }

    // ===== VENDA =====
    case 'venda_tipo_imovel':
      dados.tipo_imovel = msg;
      console.log('Domus Bot: Em qual bairro fica o imóvel que você deseja vender?');
      estado = 'venda_bairro';
      break;

    case 'venda_bairro':
      dados.bairro = msg;
      finalizarAtendimento();
      break;

    // ===== COMPRA =====
    case 'compra_tipo_imovel':
      dados.tipo_imovel = msg;
      console.log('Domus Bot: Quantos dormitórios você procura para compra?');
      estado = 'compra_dormitorios';
      break;

    case 'compra_dormitorios':
      dados.dormitorios = msg;
      console.log('Domus Bot: Em qual bairro você procura o imóvel?');
      estado = 'compra_bairro';
      break;

    case 'compra_bairro':
      dados.bairro = msg;
      finalizarAtendimento();
      break;

    // ===== CONSÓRCIO =====
    case 'consorcio_conhece':
      tratarConhecimentoConsorcio(msg);
      break;

    case 'consorcio_tipo_bem':
      dados.tipo_bem = msg;
      console.log('Domus Bot: Qual valor aproximado de crédito você deseja?');
      estado = 'consorcio_valor';
      break;

    case 'consorcio_valor':
      dados.valor_credito = msg;
      finalizarAtendimento();
      break;

    default:
      console.log('Domus Bot: Tivemos um problema no fluxo. Reiniciando atendimento...\n');
      resetarFluxo();
      mostrarBoasVindas();
      console.log('Domus Bot: Para começarmos, qual é o seu nome?');
      estado = 'pegando_nome';
      break;
  }
}

function mostrarBoasVindas() {
  console.log('\nDomus Bot: Olá! Seja bem-vindo à Imobiliária Santin. 🏠');
  console.log(
    'Domus Bot: Nosso endereço é Rua João Massignan, 406, sala 338, bairro São Caetano.'
  );
  console.log(
    'Domus Bot: Nosso horário de atendimento é:\n' +
      '  • Segunda a sexta: 08:30 às 11:45 e 13:30 às 18:00\n' +
      '  • Sábados: 08:30 às 11:45\n'
  );
}

function mostrarMenuGarantia() {
  console.log(
    'Domus Bot: Nossas formas de locação são:\n' +
    '  1️⃣ Um fiador com dois bens imóveis;\n' +
    '  2️⃣ Dois fiadores com um bem imóvel cada um;\n' +
    '  3️⃣ CredPago (empresa que atua como sua fiadora).\n'
  );
  console.log('Domus Bot: Qual das opções você optaria? (Digite 1, 2 ou 3)');
}

function definirTipoAtendimento(msg) {
  const txt = msg.toLowerCase();

  if (txt.includes('alug')) {
    dados.atendimento = 'Aluguel';
    console.log(
      'Domus Bot: Certo, atendimento para *Aluguel*.\n' +
        'Você prefere *Casa* ou *Apartamento* para alugar?'
    );
    estado = 'aluguel_tipo_imovel';
  } else if (txt.includes('vend')) {
    dados.atendimento = 'Venda';
    console.log(
      'Domus Bot: Ótimo! Atendimento para *Venda*.\n' +
        'Qual o tipo de imóvel que você deseja vender? (Casa, Apartamento, Sala Comercial, Terreno, etc.)'
    );
    estado = 'venda_tipo_imovel';
  } else if (txt.includes('compr')) {
    dados.atendimento = 'Compra';
    console.log(
      'Domus Bot: Vamos buscar um imóvel para você! 🏡\n' +
        'Você procura qual tipo de imóvel para compra? (Casa, Apartamento, Sala Comercial, Terreno, etc.)'
    );
    estado = 'compra_tipo_imovel';
  } else if (txt.includes('consór') || txt.includes('consor')) {
    dados.atendimento = 'Consórcio';
    console.log(
      'Domus Bot: Perfeito, atendimento para *Consórcio*.\n' +
        'Você já conhece como funciona o consórcio? (Responda *Sim* ou *Não*)'
    );
    estado = 'consorcio_conhece';
  } else {
    console.log(
      'Domus Bot: Não entendi muito bem. Você deseja *Aluguel*, *Venda*, *Compra* ou *Consórcio*?'
    );
  }
}

function tratarConhecimentoConsorcio(msg) {
  const txt = msg.toLowerCase();

  if (txt.startsWith('n')) {
    console.log(
      '\nDomus Bot: Sem problemas, eu te explico rapidinho:\n' +
        'O consórcio é uma modalidade de compra planejada e cooperativa, baseada na união de pessoas (físicas ou jurídicas) em um grupo fechado, ' +
        'com o objetivo de formar uma poupança comum para a aquisição de bens móveis, imóveis ou serviços.\n' +
        'É uma forma de *autofinanciamento sem juros*, ótima para quem quer planejar a aquisição de imóvel, veículo ou outros objetivos de forma organizada! 💡\n'
    );
  } else if (txt.startsWith('s')) {
    console.log('Domus Bot: Ótimo, então vamos direto aos detalhes. 😉\n');
  } else {
    console.log(
      'Domus Bot: Vou considerar que você quer entender melhor, tudo bem?'
    );
    console.log(
      'Em resumo, o consórcio é uma forma de compra planejada em grupo, sem juros, para adquirir bens ou serviços.\n'
    );
  }

  console.log(
    'Domus Bot: Você deseja consórcio para *Imóvel*, *Veículo* ou outro bem/serviço?'
  );
  estado = 'consorcio_tipo_bem';
}

function finalizarAtendimento() {
  console.log('\n------------------------------------------');
  console.log(' RESUMO DO ATENDIMENTO PARA O CORRETOR ');
  console.log('------------------------------------------');
  console.log(`Nome: ${dados.nome || 'não informado'}`);
  console.log(`Tipo de atendimento: ${dados.atendimento || 'não informado'}`);

  if (dados.tipo_imovel) console.log(`Tipo de imóvel: ${dados.tipo_imovel}`);
  if (dados.dormitorios) console.log(`Dormitórios: ${dados.dormitorios}`);
  if (dados.bairro) console.log(`Bairro: ${dados.bairro}`);

  if (dados.filhos) console.log(`Possui filhos: ${dados.filhos}`);
  if (dados.idade_filhos) console.log(`Idade das crianças: ${dados.idade_filhos}`);
  if (dados.tem_pet) console.log(`Possui pet: ${dados.tem_pet}`);
  if (dados.info_pet) console.log(`Detalhes do pet: ${dados.info_pet}`);

  if (dados.tipo_bem) console.log(`Tipo de bem (consórcio): ${dados.tipo_bem}`);
  if (dados.valor_credito) console.log(`Valor de crédito desejado: ${dados.valor_credito}`);

  if (dados.forma_locacao) console.log(`Forma de locação: ${dados.forma_locacao}`);

  console.log('------------------------------------------');
  console.log(
    'Domus Bot: Atendimento enviado para o corretor responsável. 📲\n' +
      'Domus Bot: Atendimento automático encerrado!\n'
  );

  resetarFluxo();

  console.log(
    'Se quiser simular outro atendimento, escreva qualquer mensagem.\n' +
      'Ou digite "sair" para encerrar.\n'
  );
}

function resetarFluxo() {
  estado = 'inicio';
  dados = {};
}

function perguntar() {
  if (encerrado) return;
  rl.question('Cliente: ', async (texto) => {
    await processarMensagem(texto);
    perguntar();
  });
}

perguntar();
