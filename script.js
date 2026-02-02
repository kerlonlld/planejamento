// --- 1. MEMÓRIA PERMANENTE (LOCALSTORAGE) ---
// Tentamos buscar os dados salvos no navegador. Se não existir nada, criamos uma lista vazia []
let historico = JSON.parse(localStorage.getItem('dadosFinanceiros')) || []; 
let carteiraInvestimentos = JSON.parse(localStorage.getItem('minhaCarteira')) || [];
let carteiraLazer = JSON.parse(localStorage.getItem('meuLazer')) || [];
let listaImoveis = JSON.parse(localStorage.getItem('meusImoveis')) || [];
let listaAutomoveis = JSON.parse(localStorage.getItem('meusAutomoveis')) || [];
let chartEvolucao; // Variável que guardará o objeto do gráfico (Chart.js)

// --- 2. INICIALIZAÇÃO E ESTILO ---
// Esse bloco roda assim que a página termina de carregar
document.addEventListener("DOMContentLoaded", function() {
// Criamos um bloco de CSS direto no JS para esconder as barras de rolagem brancas
const estiloLayout = `
.coluna-financas, #listaInvestimentos, #listaLazeres, #listaImoveis, #listaAutomoveis {
max-height: 75vh !important;  /* Limita a altura a 75% da tela */
overflow-y: auto !important; /* Permite rolar se o conteúdo crescer */
scrollbar-width: none !important; /* Esconde barra no Firefox */
}
 /* Esconde a barra de rolagem no Chrome e Safari */
.coluna-financas::-webkit-scrollbar, [id^="lista"]::-webkit-scrollbar {
 display: none !important;
 } /* Define o tamanho máximo do gráfico para ele não sumir lá embaixo */
 #graficoEvolucao { max-height: 380px !important; width: 100% !important; }
 
 /* Estilo visual dos cartões de itens salvos */
 .item-salvo {
 background: #1a1a1a; margin: 8px 0; padding: 12px; border-radius: 8px;
 display: flex; justify-content: space-between; align-items: center;
 border-left: 5px solid #0f67d2; color: white;
 }
 `;
 const styleSheet = document.createElement("style"); // Cria o elemento <style>
 styleSheet.innerText = estiloLayout;  // Coloca o texto acima dentro dele
 document.head.appendChild(styleSheet);  // Adiciona o estilo no topo do site

 try { initChart(); } catch(e) {} // Tenta desenhar o gráfico se houver dados
 renderizarTudo(); // Mostra as listas de investimentos/imóveis na tela
 showSection('inicio');  // Garante que o site comece na tela inicial 
    // Migração: se existia um único `userData`, converte para array `users`
    (function migrateUserData() {
        try {
            const antigo = JSON.parse(localStorage.getItem('userData'));
            const usuarios = JSON.parse(localStorage.getItem('users')) || [];
            if (antigo && !usuarios.find(u => u.email === antigo.email)) {
                usuarios.push(antigo);
                localStorage.setItem('users', JSON.stringify(usuarios));
            }
        } catch (e) {
            // não faz nada se o parse falhar
        }
    })();
 // Lógica para sumir com o Loader (tela de carregamento)
 const loader = document.getElementById("loader-container");
if (loader) {
 setTimeout(() => {
 loader.style.opacity = "0"; // Faz o loader ficar transparente
 setTimeout(() => loader.style.display = "none", 500); // Remove ele do caminho
 }, 1000);
 }
 
 // Event listeners para o login
 const conteiner = document.getElementById('conteiner');
 const registerBtn = document.getElementById('registro');
 const loginBtn = document.getElementById('login');
 const loginForm = document.querySelector('.sing-in form');
 const registerForm = document.querySelector('.sing-up form');

 if (registerBtn) {
     registerBtn.addEventListener('click', () => {
         conteiner.classList.add('active');
     });
 }

 if (loginBtn) {
     loginBtn.addEventListener('click', () => {
         conteiner.classList.remove('active');
     });
 }

 if (loginForm) {
     loginForm.addEventListener('submit', function(e) {
         e.preventDefault();
         const emailInput = this.querySelector('input[type="email"]');
         const passwordInput = this.querySelector('input[type="password"]');
         const email = emailInput.value.trim();
         const password = passwordInput.value.trim();

         if (!email || !password) {
             alert('Por favor, preencha todos os campos!');
             return;
         }
         if (!validateEmail(email)) {
             alert('Por favor, insira um email válido!');
             return;
         }
         if (password.length < 6) {
             alert('A senha deve ter pelo menos 6 caracteres!');
             return;
         }

        // Recupera usuários cadastrados (suporta vários)
        const usuarios = JSON.parse(localStorage.getItem('users')) || [];
        const userData = usuarios.find(u => u.email === email && u.password === password);
        if (userData) {
             // Login bem-sucedido
             emailInput.value = "";
             passwordInput.value = "";
             conteiner.style.display = 'none';
            // Marca usuário atual
            const currentUser = { name: userData.name, email: userData.email, role: userData.role };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
             
             // Mostra o loader
             const loaderContainer = document.getElementById('loader-container');
             if (loaderContainer) {
                 loaderContainer.style.display = 'flex';
                 loaderContainer.style.opacity = '1';
                 
                 // Aguarda 2 segundos e vai para a página inicial
                 setTimeout(() => {
                     loaderContainer.style.opacity = '0';
                     setTimeout(() => {
                         loaderContainer.style.display = 'none';
                         showSection('inicio');
                     }, 500);
                 }, 2000);
             } else {
                 showSection('inicio');
             }
        } else if (email === 'admin@klld.com' && password === '123456') {
             // Conta padrão para teste
             emailInput.value = "";
             passwordInput.value = "";
             conteiner.style.display = 'none';
            localStorage.setItem('currentUser', JSON.stringify({ name: 'Admin', email: 'admin@klld.com', role: 'admin' }));
             
             // Mostra o loader
             const loaderContainer = document.getElementById('loader-container');
             if (loaderContainer) {
                 loaderContainer.style.display = 'flex';
                 loaderContainer.style.opacity = '1';
                 
                 // Aguarda 2 segundos e vai para a página inicial
                 setTimeout(() => {
                     loaderContainer.style.opacity = '0';
                     setTimeout(() => {
                         loaderContainer.style.display = 'none';
                         showSection('inicio');
                     }, 500);
                 }, 2000);
             } else {
                 showSection('inicio');
             }
        } else {
            alert('Email ou senha incorretos!');
        }
     });
 }

 if (registerForm) {
     registerForm.addEventListener('submit', (e) => {
         e.preventDefault();
         const name = registerForm.querySelector('input[type="text"]').value.trim();
         const email = registerForm.querySelector('input[type="email"]').value.trim();
         const password = registerForm.querySelector('input[type="password"]').value.trim();

         if (!name || !email || !password) {
             alert('Por favor, preencha todos os campos!');
             return;
         }
         if (!validateEmail(email)) {
             alert('Por favor, insira um email válido!');
             return;
         }
         if (password.length < 6) {
             alert('A senha deve ter pelo menos 6 caracteres!');
             return;
         }

         // Salva dados no localStorage em um array 'users' para permitir múltiplos cadastros
         const usuarios = JSON.parse(localStorage.getItem('users')) || [];
         if (usuarios.find(u => u.email === email)) {
             alert('Este email já está cadastrado. Faça login ou use outro email.');
             return;
         }
         // Define role: primeiro usuário cadastrado = admin
         const role = usuarios.length === 0 ? 'admin' : 'user';
         usuarios.push({ name, email, password, role });
         localStorage.setItem('users', JSON.stringify(usuarios));
         alert('Conta criada com sucesso! Agora faça login.');
         conteiner.classList.remove('active');
         registerForm.reset();
     });
 }
});

// --- 3. SEÇÃO: FINANÇAS E BOTÃO VOLTAR ---

// Atalhos para as funções de faturamento e dívida
// --- ENVIAR APENAS FATURAMENTO ---
function enviarfatura() {
    const vReceitas = [10, 11, 12, 13, 14, 15, 16, 17, 18];
    let totalRec = 0;

    vReceitas.forEach(id => {
        const campo = document.getElementById(id.toString());
        if (campo) totalRec += Number(campo.value || 0);
    });

    if (totalRec === 0) {
        alert("Digite algum valor de faturamento antes de enviar!");
        return;
    }

    salvarNoHistorico(totalRec); // Envia o valor positivo
    limparCampos(vReceitas);
    
}

// --- ENVIAR APENAS DESPESAS ---
function enviardivida() {
    const vDespesas = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let totalDes = 0;

    vDespesas.forEach(id => {
        const campo = document.getElementById(id.toString());
        if (campo) totalDes += Number(campo.value || 0);
    });

    if (totalDes === 0) {
        alert("Digite algum valor de despesa antes de enviar!");
        return;
    }

    salvarNoHistorico(-totalDes); // Envia o valor negativo (subtração)
    limparCampos(vDespesas);
    
}

// --- FUNÇÃO AUXILIAR PARA SALVAR E ATUALIZAR ---
function salvarNoHistorico(valorMudanca) {
    const agora = new Date();
    const hora = agora.getHours() + ":" + String(agora.getMinutes()).padStart(2, '0');
    
    // Pega o último saldo para acumular, ou começa do zero
    let ultimoSaldo = historico.length > 0 ? historico[historico.length - 1].saldo : 0;
    let novoSaldo = ultimoSaldo + valorMudanca;

    historico.push({ hora: hora, saldo: novoSaldo });
    localStorage.setItem('dadosFinanceiros', JSON.stringify(historico));
    
    initChart(filtroAtual); // Atualiza o gráfico
    atualizarInterface(0, 0, novoSaldo); // Atualiza o Valor Final na tela
}

// --- LIMPAR CAMPOS APÓS ENVIO ---
function limparCampos(ids) {
    ids.forEach(id => {
        const campo = document.getElementById(id.toString());
        if (campo) campo.value = "";
    });
}

// FUNÇÃO VOLTAR: Desfaz o último ponto do gráfico e atualiza o Valor Final
function voltarResultado() {
 if (historico.length > 0) {
 historico.pop(); // Remove o ÚLTIMO item da lista de histórico
 localStorage.setItem('dadosFinanceiros', JSON.stringify(historico)); // Salva a lista nova sem esse item
 
 initChart(); // Redesenha o gráfico sem o ponto que removemos

 // Se ainda sobrar algum dado no histórico após apagar
 if (historico.length > 0) {
 const ultimoRestante = historico[historico.length - 1]; // Pega o novo "último"
 atualizarInterface(0, 0, ultimoRestante.saldo); // Atualiza o Valor Final na tela
 } else {
 atualizarInterface(0, 0, 0); // Se a lista ficou vazia, zera os textos
 }

 // Limpa todas as caixinhas de entrada (inputs)
const inputs = document.querySelectorAll('.coluna-financas input');
 inputs.forEach(input => input.value = ""); 
alert("Último lançamento desfeito com sucesso!");
 } else {
 alert("Não há lançamentos para voltar.");
}
}

// Faz a soma de tudo que você digitou e adiciona no gráfico
function processarCalculosGerais() {
const vReceitas = [10, 11, 12, 13, 14, 15, 16, 17, 18]; // IDs dos campos de ganhos
 const vDespesas = [1, 2, 3, 4, 5, 6, 7, 8, 9];// IDs dos campos de gastos
 let totalRec = 0; let totalDes = 0;

 // Soma os valores de faturamento
 vReceitas.forEach(id => {
 const campo = document.getElementById(id.toString());
if (campo) totalRec += Number(campo.value || 0);
 });
 // Soma os valores de despesas
 vDespesas.forEach(id => {
 const campo = document.getElementById(id.toString());
 if (campo) totalDes += Number(campo.value || 0);
});

let saldoFinal = totalRec - totalDes; // Calcula o lucro ou prejuízo
const agora = new Date();  // Pega a data/hora atual
const hora = agora.getHours() + ":" + String(agora.getMinutes()).padStart(2, '0'); // Formata 00:00

 historico.push({ hora: hora, saldo: saldoFinal }); // Adiciona o novo saldo na lista
 localStorage.setItem('dadosFinanceiros', JSON.stringify(historico)); // Salva permanentemente
 
    initChart('mes'); // Atualiza o gráfico com o novo ponto (padrão: mês)
    atualizarInterface(totalRec, totalDes, saldoFinal); // Atualiza os textos na tela
}

// Variável para armazenar o filtro atual
let filtroAtual = 'mes'; // padrão: mês

// Configuração técnica do Gráfico (Chart.js)
function initChart(filtro = 'mes') {
    filtroAtual = filtro;
    const canvas = document.getElementById('graficoEvolucao');
    if (!canvas) return;
    if (chartEvolucao) chartEvolucao.destroy(); // Apaga o gráfico velho antes de criar um novo
    
    // Filtra dados baseado no tipo de filtro
    const dadosFiltrados = filtrarHistorico(historico, filtro);
    
    const ctx = canvas.getContext('2d');
    chartEvolucao = new Chart(ctx, {
 type: 'line', // Tipo de gráfico: Linha
 data: {
 labels: dadosFiltrados.map(h => h.hora), // Eixo X: as horas dos envios
 datasets: [{
 label: 'Saldo (R$)',
data: dadosFiltrados.map(h => h.saldo), // Eixo Y: os valores dos saldos
 borderColor: '#0f67d2',            // Cor da linha
 backgroundColor: 'rgba(15, 103, 210, 0.2)', // Cor do preenchimento
 fill: true,  // Preenche embaixo da linha
 tension: 0.4 // Deixa a linha curvada (suave)
 }]
 },
 options: { responsive: true, maintainAspectRatio: false } // Gráfico se adapta ao tamanho da div
 });
    
    // Adiciona evento de clique ao canvas para abrir modal
    canvas.addEventListener('click', abrirGraficoModal);
    canvas.style.cursor = 'pointer';
}

// Função para filtrar dados por período
function filtrarHistorico(dados, filtro) {
    const agora = new Date();
    let dataLimite = new Date();
    
    if (filtro === 'dia') {
        // Últimas 24 horas
        dataLimite.setDate(agora.getDate() - 1);
    } else if (filtro === 'semana') {
        // Últimos 7 dias
        dataLimite.setDate(agora.getDate() - 7);
    } else if (filtro === 'mes') {
        // Últimos 30 dias
        dataLimite.setDate(agora.getDate() - 30);
    }
    
    return dados.filter(item => {
        // Tenta parsear a hora (formato esperado: "DD/MM/YYYY HH:MM" ou "HH:MM")
        let dataItem = new Date();
        const partes = item.hora.split(' ');
        
        if (partes.length === 2) {
            // Formato: "DD/MM/YYYY HH:MM"
            const [data, hora] = partes;
            const [dia, mes, ano] = data.split('/').map(Number);
            const [h, m] = hora.split(':').map(Number);
            dataItem = new Date(ano, mes - 1, dia, h, m);
        } else if (partes.length === 1 && partes[0].includes(':')) {
            // Formato: "HH:MM" (assume hoje)
            const [h, m] = partes[0].split(':').map(Number);
            dataItem = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), h, m);
        }
        
        return dataItem >= dataLimite;
    });
}

// Atualiza os números (Total Faturamento, Total Despesa e Saldo Final) que aparecem no site
function atualizarInterface(receitas, despesas, saldo) {
 const formatar = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2 }); // Função para formatar em R$
 const d1 = document.getElementById("grafico");
 const d2 = document.getElementById("grafico2");
 if(d1) d1.innerHTML = `Total: R$ ${formatar(receitas)}`;
 if(d2) d2.innerHTML = `Total: R$ ${formatar(despesas)}`; 
const valFinal = document.getElementById("valor_final");
 if(valFinal) {
 const p = valFinal.querySelector("p") || valFinal;
 p.innerText = `R$ ${formatar(saldo)}`; // Coloca o saldo final no texto central
 valFinal.style.color = saldo < 0 ? "#ff4d4d" : "#00ff88"; // Vermelho se negativo, verde se positivo
 }
}

// --- 4. GESTÃO DE ITENS PERMANENTES (CARTEIRAS) ---

// Chama a renderização de todas as listas salvas
function renderizarTudo() {
 renderizarLista('listaInvestimentos', carteiraInvestimentos, 'minhaCarteira');
renderizarLista('listaLazeres', carteiraLazer, 'meuLazer');
renderizarLista('listaImoveis', listaImoveis, 'meusImoveis');
 renderizarLista('listaAutomoveis', listaAutomoveis, 'meusAutomoveis');
}

// Função genérica para criar o HTML das listas de itens salvos
function renderizarLista(id, array, chave) {
    const container = document.getElementById(id);
    if (!container) return;
    container.innerHTML = ""; // Limpa a lista antes de desenhar para não duplicar
    
    if (array.length === 0) {
        container.innerHTML = '<p class="empty-msg">Nenhum item registrado.</p>';
        return;
    }
    
    array.forEach((item, index) => {
        const nome = item.nome || item.atividade || item.endereco || item.modelo; // Identifica o nome do item
        const valor = item.valor || item.custo; // Identifica o preço
        
        // Se for investimento, mostra todos os dados
        if (chave === 'minhaCarteira' && item.tipo) {
            container.innerHTML += `
                <div class="item-salvo">
                    <div style="width: 100%; font-size: 12px;">
                        <strong>${nome}</strong><br>
                        💰 R$ ${valor.toLocaleString('pt-BR')}<br>
                        📊 Tipo: ${item.tipo}<br>
                        📈 Rendimento: ${item.rendimento || '-'}%<br>
                        ⏱️ Prazo: ${item.prazo || '-'} meses<br>
                        ⚠️ Risco: ${item.risco || '-'}<br>
                        📅 Data: ${item.data || '-'}
                    </div>
                    <button onclick="removerItem('${chave}', ${index})" style="color:red; background:none; border:none; cursor:pointer; margin-top: 5px;">✕ Remover</button>
                </div>`;
        } 
        // Se for lazer, mostra todos os dados
        else if (chave === 'meuLazer' && item.atividade) {
            container.innerHTML += `
                <div class="item-salvo">
                    <div style="width: 100%; font-size: 12px;">
                        <strong>${nome}</strong><br>
                        💰 R$ ${valor.toLocaleString('pt-BR')}<br>
                        💳 Pagamento: ${item.pagamento || '-'}<br>
                        📅 Data: ${item.data || '-'}<br>
                        📝 Nota: ${item.nota || '-'}
                    </div>
                    <button onclick="removerItem('${chave}', ${index})" style="color:red; background:none; border:none; cursor:pointer; margin-top: 5px;">✕ Remover</button>
                </div>`;
        }
        // Se for imóvel, mostra todos os dados
        else if (chave === 'meusImoveis' && item.endereco) {
            container.innerHTML += `
                <div class="item-salvo">
                    <div style="width: 100%; font-size: 12px;">
                        <strong>${item.endereco}</strong><br>
                        💰 R$ ${valor.toLocaleString('pt-BR')}<br>
                        🏠 Tipo: ${item.tipo || '-'}<br>
                        📏 Área: ${item.area || '-'} m²<br>
                        📅 Aquisição: ${item.ano || '-'}<br>
                        📆 Data: ${item.data || '-'}
                    </div>
                    <button onclick="removerItem('${chave}', ${index})" style="color:red; background:none; border:none; cursor:pointer; margin-top: 5px;">✕ Remover</button>
                </div>`;
        }
        // Se for automóvel, mostra todos os dados
        else if (chave === 'meusAutomoveis' && item.modelo) {
            container.innerHTML += `
                <div class="item-salvo">
                    <div style="width: 100%; font-size: 12px;">
                        <strong>${item.modelo}</strong><br>
                        💰 R$ ${valor.toLocaleString('pt-BR')}<br>
                        🚗 Tipo: ${item.tipo || '-'}<br>
                        📅 Ano: ${item.ano || '-'}<br>
                        ⛽ Combustível: ${item.combustivel || '-'}<br>
                        🔧 Manutenção: ${item.manutencao || '-'}<br>
                        🛡️ Seguro: ${item.seguro || '-'}<br>
                        💧 Gasto Combustível: R$ ${item.gasolina ? parseFloat(item.gasolina).toLocaleString('pt-BR') : '-'}
                    </div>
                    <button onclick="removerItem('${chave}', ${index})" style="color:red; background:none; border:none; cursor:pointer; margin-top: 5px;">✕ Remover</button>
                </div>`;
        }
        else {
            // Para outros itens, mostra versão simples
            container.innerHTML += `
                <div class="item-salvo">
                    <span>${nome}</span> <span> R$ ${valor.toLocaleString('pt-BR')}</span>
                    <button onclick="removerItem('${chave}', ${index})" style="color:red; background:none; border:none; cursor:pointer;">✕</button>
                </div>`;
        }
    });
}

// Remove um item específico da memória permanente
function removerItem(chave, index) {
    let dados = JSON.parse(localStorage.getItem(chave)); // Pega a lista do banco
    dados.splice(index, 1); // Remove o item daquela posição (index)
    localStorage.setItem(chave, JSON.stringify(dados)); // Salva a lista atualizada
    
    // Atualiza a variável global correspondente
    if (chave === 'minhaCarteira') {
        carteiraInvestimentos = dados;
    } else if (chave === 'meuLazer') {
        carteiraLazer = dados;
    } else if (chave === 'meusImoveis') {
        listaImoveis = dados;
    } else if (chave === 'meusAutomoveis') {
        listaAutomoveis = dados;
    }
    
    // Renderiza apenas a lista, sem recarregar a página
    renderizarTudo();
}

// Função auxiliar para converter data de YYYY-MM-DD para DD/MM/YYYY
function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

// --- FUNÇÕES PARA ADICIONAR ITENS NOVOS ---
function adicionarInvestimento() {
    const nome = document.getElementById('investimentoNome').value;
    const valor = document.getElementById('investimentoValor').value;
    const tipo = document.getElementById('investimentoTipo').value;
    const rendimento = document.getElementById('investimentoRendimento').value;
    const prazo = document.getElementById('investimentoPrazo').value;
    const risco = document.getElementById('investimentoRiesgo').value;
    const data = formatarData(document.getElementById('investimentoData').value);
    
    if(!nome || !valor) return;
    
    carteiraInvestimentos.push({ 
        nome: nome, 
        valor: parseFloat(valor),
        tipo: tipo,
        rendimento: rendimento,
        prazo: prazo,
        risco: risco,
        data: data
    });
    localStorage.setItem('minhaCarteira', JSON.stringify(carteiraInvestimentos));
    renderizarTudo();
}

function adicionarLazer() {
    const atividade = document.getElementById('lazerAtividade').value;
    const pagamento = document.getElementById('lazerPagamento').value;
    const custo = document.getElementById('lazerCusto').value;
    const data = formatarData(document.getElementById('lazerData').value);
    const nota = document.getElementById('lazerNota').value;
    
    if(!custo) return;
    
    carteiraLazer.push({ 
        atividade: atividade, 
        pagamento: pagamento,
        custo: parseFloat(custo),
        data: data,
        nota: nota
    });
    localStorage.setItem('meuLazer', JSON.stringify(carteiraLazer));
    renderizarTudo();
}

function adicionarImovel() {
    const endereco = document.getElementById('imovelEndereco').value;
    const tipo = document.getElementById('imovelTipo').value;
    const valor = document.getElementById('imovelValor').value;
    const ano = document.getElementById('imovelAno').value;
    const area = document.getElementById('imovelArea').value;
    const data = formatarData(document.getElementById('imovelData').value);
    
    if(!endereco || !valor) {
        alert('Por favor, preencha endereço e valor!');
        return;
    }
    
    listaImoveis.push({ 
        endereco: endereco, 
        tipo: tipo,
        valor: parseFloat(valor),
        ano: ano,
        area: area,
        data: data
    });
    
    localStorage.setItem('meusImoveis', JSON.stringify(listaImoveis));
    
    // Limpar formulário
    document.getElementById('imovelEndereco').value = '';
    document.getElementById('imovelTipo').value = 'Selecione';
    document.getElementById('imovelValor').value = '';
    document.getElementById('imovelAno').value = '';
    document.getElementById('imovelArea').value = '';
    document.getElementById('imovelData').value = '';
    
    renderizarTudo();
}

function adicionarAutomovel() {
    const tipo = document.getElementById('automovelTipo').value;
    const modelo = document.getElementById('automovelModelo').value;
    const ano = document.getElementById('automovelAno').value;
    const valor = document.getElementById('automovelValor').value;
    const combustivel = document.getElementById('combustivelAutomovel').value;
    const manutencao = document.getElementById('manutencaoAutomovel').value;
    const seguro = document.getElementById('seguroAutomovel').value;
    const gasolina = document.getElementById('quantidadeGasolina').value;
    
    if(!modelo || !valor) {
        alert('Por favor, preencha modelo e valor!');
        return;
    }
    
    listaAutomoveis.push({ 
        tipo: tipo,
        modelo: modelo,
        ano: ano,
        valor: parseFloat(valor),
        combustivel: combustivel,
        manutencao: manutencao,
        seguro: seguro,
        gasolina: gasolina ? parseFloat(gasolina) : 0
    });
    
    localStorage.setItem('meusAutomoveis', JSON.stringify(listaAutomoveis));
    
    // Limpar formulário
    document.getElementById('automovelTipo').value = 'Selecione';
    document.getElementById('automovelModelo').value = '';
    document.getElementById('automovelAno').value = '';
    document.getElementById('automovelValor').value = '';
    document.getElementById('combustivelAutomovel').value = 'Selecione';
    document.getElementById('manutencaoAutomovel').value = 'Selecione';
    document.getElementById('seguroAutomovel').value = 'Selecione';
    document.getElementById('quantidadeGasolina').value = '';
    
    renderizarTudo();
}

// --- 5. NAVEGAÇÃO ---

// Troca as telas do aplicativo (esconde uma e mostra a outra)
function showSection(id) {
 document.querySelectorAll('.financeira').forEach(s => s.style.display = 'none'); // Esconde todas
 const sec = document.getElementById(id);
if (sec) sec.style.display = 'block'; // Mostra apenas a que você clicou
}

// Abre/Fecha a janelinha de login
function abrirLogin() {
    const log = document.getElementById('conteiner');
    if (log) log.style.display = (log.style.display === 'flex') ? 'none' : 'flex';
}

// Validar email
function validateEmail(email) {
    return email.includes('@') && email.includes('.');
}

// Funções para Modal do Gráfico
function abrirGraficoModal() {
    const modal = document.getElementById('graficoModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Cria uma cópia do gráfico na modal
        const canvasModal = document.getElementById('graficoModal-canvas');
        if (canvasModal && chartEvolucao) {
            // Aguarda um pouco para o canvas estar pronto
            setTimeout(() => {
                const ctxModal = canvasModal.getContext('2d');
                
                // Cria novo gráfico no canvas da modal
                if (window.chartModal) {
                    window.chartModal.destroy();
                }
                
                window.chartModal = new Chart(ctxModal, {
                    type: 'line',
                    data: {
                        labels: historico.map(h => h.hora),
                        datasets: [{
                            label: 'Saldo (R$)',
                            data: historico.map(h => h.saldo),
                            borderColor: '#0f67d2',
                            backgroundColor: 'rgba(15, 103, 210, 0.2)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                labels: {
                                    color: '#d2d4d7fd'
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: '#d2d4d7fd'
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                }
                            },
                            y: {
                                ticks: {
                                    color: '#d2d4d7fd'
                                },
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                }
                            }
                        }
                    }
                });
            }, 100);
        }
    }
}

function fecharGraficoModal() {
    const modal = document.getElementById('graficoModal');
    if (modal) {
        modal.style.display = 'none';
        if (window.chartModal) {
            window.chartModal.destroy();
            window.chartModal = null;
        }
    }
}

// Fecha modal ao clicar fora dela
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('graficoModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                fecharGraficoModal();
            }
        });
    }
});

// Botão de pânico: limpa toda a memória do navegador e reseta o site
function reiniciarTudo() {
    if(confirm("Apagar TUDO permanentemente?")) { localStorage.clear(); location.reload(); }
}

// ------------------------ Export / Import / Sync / Password Reset ------------------------

function downloadFile(filename, content, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function exportAllJSON() {
    const payload = {
        users: JSON.parse(localStorage.getItem('users')) || [],
        dadosFinanceiros: JSON.parse(localStorage.getItem('dadosFinanceiros')) || [],
        minhaCarteira: JSON.parse(localStorage.getItem('minhaCarteira')) || [],
        meuLazer: JSON.parse(localStorage.getItem('meuLazer')) || [],
        meusImoveis: JSON.parse(localStorage.getItem('meusImoveis')) || [],
        meusAutomoveis: JSON.parse(localStorage.getItem('meusAutomoveis')) || []
    };
    downloadFile('planilia-backup-' + new Date().toISOString().slice(0,10) + '.json', JSON.stringify(payload, null, 2));
}

function handleImportJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm('Deseja mesclar os dados do arquivo com os dados locais? (OK = mesclar, Cancel = substituir)')) {
                mergeImportedData(data);
            } else {
                overwriteImportedData(data);
            }
            alert('Importação concluída.');
            renderizarTudo();
            initChart(filtroAtual || 'mes');
        } catch (err) {
            alert('Arquivo JSON inválido.');
        }
    };
    reader.readAsText(file);
}

function mergeImportedData(data) {
    if (data.users) {
        const local = JSON.parse(localStorage.getItem('users')) || [];
        data.users.forEach(u => { if (!local.find(l => l.email === u.email)) local.push(u); });
        localStorage.setItem('users', JSON.stringify(local));
    }
    if (data.dadosFinanceiros) {
        const local = JSON.parse(localStorage.getItem('dadosFinanceiros')) || [];
        data.dadosFinanceiros.forEach(item => local.push(item));
        localStorage.setItem('dadosFinanceiros', JSON.stringify(local));
    }
    if (data.minhaCarteira) {
        const local = JSON.parse(localStorage.getItem('minhaCarteira')) || [];
        data.minhaCarteira.forEach(i => local.push(i));
        localStorage.setItem('minhaCarteira', JSON.stringify(local));
    }
    if (data.meuLazer) {
        const local = JSON.parse(localStorage.getItem('meuLazer')) || [];
        data.meuLazer.forEach(i => local.push(i));
        localStorage.setItem('meuLazer', JSON.stringify(local));
    }
    if (data.meusImoveis) {
        const local = JSON.parse(localStorage.getItem('meusImoveis')) || [];
        data.meusImoveis.forEach(i => local.push(i));
        localStorage.setItem('meusImoveis', JSON.stringify(local));
    }
    if (data.meusAutomoveis) {
        const local = JSON.parse(localStorage.getItem('meusAutomoveis')) || [];
        data.meusAutomoveis.forEach(i => local.push(i));
        localStorage.setItem('meusAutomoveis', JSON.stringify(local));
    }
}

function overwriteImportedData(data) {
    if (data.users) localStorage.setItem('users', JSON.stringify(data.users));
    if (data.dadosFinanceiros) localStorage.setItem('dadosFinanceiros', JSON.stringify(data.dadosFinanceiros));
    if (data.minhaCarteira) localStorage.setItem('minhaCarteira', JSON.stringify(data.minhaCarteira));
    if (data.meuLazer) localStorage.setItem('meuLazer', JSON.stringify(data.meuLazer));
    if (data.meusImoveis) localStorage.setItem('meusImoveis', JSON.stringify(data.meusImoveis));
    if (data.meusAutomoveis) localStorage.setItem('meusAutomoveis', JSON.stringify(data.meusAutomoveis));
}

function exportHistoricoCSV() {
    const historicoLocal = JSON.parse(localStorage.getItem('dadosFinanceiros')) || [];
    if (!historicoLocal.length) { alert('Nenhum histórico para exportar.'); return; }
    const rows = [['hora','saldo']];
    historicoLocal.forEach(h => rows.push([h.hora, String(h.saldo)]));
    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\n');
    downloadFile('historico-' + new Date().toISOString().slice(0,10) + '.csv', csv, 'text/csv');
}

function handleImportCSV(event) {
    const file = event.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const parsed = parseCSVtoHistorico(text);
        if (!parsed.length) { alert('CSV inválido ou vazio.'); return; }
        const local = JSON.parse(localStorage.getItem('dadosFinanceiros')) || [];
        parsed.forEach(r => local.push(r));
        localStorage.setItem('dadosFinanceiros', JSON.stringify(local));
        alert('CSV importado com sucesso.');
        initChart(filtroAtual || 'mes');
    };
    reader.readAsText(file);
}

function parseCSVtoHistorico(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return [];
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(c => c.replace(/^"|"$/g, ''));
        if (cols.length >= 2) {
            result.push({ hora: cols[0], saldo: Number(cols[1]) });
        }
    }
    return result;
}

async function syncUpload() {
    const endpoint = (document.getElementById('syncEndpoint') || {}).value || '';
    if (!endpoint) { alert('Informe o endpoint de sincronização.'); return; }
    const payload = {
        users: JSON.parse(localStorage.getItem('users')) || [],
        dadosFinanceiros: JSON.parse(localStorage.getItem('dadosFinanceiros')) || [],
        minhaCarteira: JSON.parse(localStorage.getItem('minhaCarteira')) || [],
        meuLazer: JSON.parse(localStorage.getItem('meuLazer')) || [],
        meusImoveis: JSON.parse(localStorage.getItem('meusImoveis')) || [],
        meusAutomoveis: JSON.parse(localStorage.getItem('meusAutomoveis')) || []
    };
    try {
        const res = await fetch(endpoint.replace(/\/$/, '') + '/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error('Erro ao enviar');
        alert('Dados enviados ao servidor com sucesso.');
    } catch (err) {
        alert('Falha ao sincronizar: ' + err.message);
    }
}

async function syncDownload() {
    const endpoint = (document.getElementById('syncEndpoint') || {}).value || '';
    if (!endpoint) { alert('Informe o endpoint de sincronização.'); return; }
    try {
        const res = await fetch(endpoint.replace(/\/$/, '') + '/sync');
        if (!res.ok) throw new Error('Erro ao baixar');
        const data = await res.json();
        if (confirm('Deseja mesclar (OK) ou substituir (Cancelar) os dados locais com os do servidor?')) {
            mergeImportedData(data);
        } else {
            overwriteImportedData(data);
        }
        alert('Sincronização concluída.');
        renderizarTudo();
        initChart(filtroAtual || 'mes');
    } catch (err) {
        alert('Falha ao baixar sincronização: ' + err.message);
    }
}

// Password reset (client-side mock if no server)
function requestPasswordReset() {
    const email = (document.getElementById('recoveryEmail') || {}).value || '';
    if (!email) { alert('Digite um email para recuperar.'); return; }
    const endpoint = (document.getElementById('syncEndpoint') || {}).value || '';
    if (endpoint) {
        // Try server-based flow
        fetch(endpoint.replace(/\/$/, '') + '/request-reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
            .then(r => r.json()).then(j => { if (j.token) document.getElementById('resetTokenContainer').innerText = 'Token enviado: ' + j.token; else alert('Solicitação enviada. Verifique seu email.'); })
            .catch(e => alert('Falha ao solicitar reset: ' + e.message));
        return;
    }
    // Client-side mock: generate token and store
    const token = Math.random().toString(36).slice(2, 10).toUpperCase();
    const tokens = JSON.parse(localStorage.getItem('resetTokens') || '{}');
    tokens[token] = { email: email, created: Date.now() };
    localStorage.setItem('resetTokens', JSON.stringify(tokens));
    document.getElementById('resetTokenContainer').innerText = 'TOKEN (mock): ' + token;
    alert('Token de recuperação gerado (mock).');
}

function performPasswordReset() {
    const token = (document.getElementById('resetTokenInput') || {}).value || '';
    const newPass = (document.getElementById('resetNewPassword') || {}).value || '';
    if (!token || !newPass) { alert('Token e nova senha são obrigatórios.'); return; }
    const endpoint = (document.getElementById('syncEndpoint') || {}).value || '';
    if (endpoint) {
        fetch(endpoint.replace(/\/$/, '') + '/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: newPass }) })
            .then(r => r.json()).then(j => alert(j.message || 'Pronto')).catch(e => alert('Erro: ' + e.message));
        return;
    }
    const tokens = JSON.parse(localStorage.getItem('resetTokens') || '{}');
    if (!tokens[token]) { alert('Token inválido ou expirado (mock).'); return; }
    const email = tokens[token].email;
    const usuarios = JSON.parse(localStorage.getItem('users')) || [];
    const u = usuarios.find(x => x.email === email);
    if (!u) { alert('Usuário não encontrado.'); return; }
    u.password = newPass;
    localStorage.setItem('users', JSON.stringify(usuarios));
    delete tokens[token];
    localStorage.setItem('resetTokens', JSON.stringify(tokens));
    alert('Senha atualizada com sucesso (mock).');
}
function abrirCalculadora() {
    const calc = document.getElementById('calculadora-modal');
    // Toggle: se estiver aberta, fecha. Se estiver fechada, abre.
    if (calc.style.display === 'flex') {
        fecharCalculadora();
    } else {
        calc.style.display = 'flex';
    }
}

function fecharCalculadora() {
    document.getElementById('calculadora-modal').style.display = 'none';
}

function inserir(num) {
    const display = document.getElementById('calc-resultado');
    if (display.value === '0') display.value = '';
    display.value += num;
}

function limparCalc() {
    document.getElementById('calc-resultado').value = '0';
}

function apagarUltimo() {
    const display = document.getElementById('calc-resultado');
    display.value = display.value.slice(0, -1);
    if (display.value === '') display.value = '0';
}

function calcular() {
    const display = document.getElementById('calc-resultado');
    try {
        // eval realiza o cálculo matemático da string
        display.value = eval(display.value);
    } catch (e) {
        display.value = 'Erro';
        setTimeout(limparCalc, 1500);
    }
}
// Funções vazias para os botões de filtro não darem erro no console
function filtrarDia() { initChart('dia'); }
function filtrarSemana() { initChart('semana'); }
function filtrarMes() { initChart('mes'); }
