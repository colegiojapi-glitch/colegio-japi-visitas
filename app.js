const SUPABASE_URL =
  "https://nvrxwausxepoikcdxule.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_u5pOZTC_-KTvXHJdL1rIIA_X_KSM1CT";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

let dataSelecionada = null;

let datasDisponiveis = [];

const horarioSelect =
  document.getElementById("horario");

const mensagem =
  document.getElementById("mensagem");

async function carregarDatas() {

  const { data, error } =
    await supabaseClient
      .from("datas_disponiveis")
      .select("*")
      .eq("ativa", true)
      .order("data");

  if (error) {
    console.error(error);
    return;
  }

  datasDisponiveis =
    data.map(item => item.data);

  gerarCalendarios();

}
function gerarCalendarios() {

  const hoje = new Date();

  criarCalendario(
    hoje.getFullYear(),
    hoje.getMonth(),
    "mesAtual"
  );

  criarCalendario(
    hoje.getMonth() === 11
      ? hoje.getFullYear() + 1
      : hoje.getFullYear(),

    (hoje.getMonth() + 1) % 12,

    "proximoMes"
  );

}
function criarCalendario(
  ano,
  mes,
  elementoId
) {

  const container =
    document.getElementById(elementoId);

  container.innerHTML = "";

  const titulo =
    document.createElement("h3");

  titulo.className =
    "calendario-titulo";

  titulo.innerText =
    new Date(
      ano,
      mes
    ).toLocaleDateString(
      "pt-BR",
      {
        month: "long",
        year: "numeric"
      }
    ).toUpperCase();

  container.appendChild(titulo);

  const grade =
    document.createElement("div");

  grade.className =
    "grade-calendario";

  const diasMes =
    new Date(
      ano,
      mes + 1,
      0
    ).getDate();

  for (
    let dia = 1;
    dia <= diasMes;
    dia++
  ) {

    const dataFormatada =
      `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

    const item =
      document.createElement("div");

    item.innerText = dia;

    if (
      datasDisponiveis.includes(
        dataFormatada
      )
    ) {

      item.className =
        "dia disponivel";

      item.onclick = () => {

        document
          .querySelectorAll(
            ".dia"
          )
          .forEach(
            d =>
              d.classList.remove(
                "selecionado"
              )
          );

        item.classList.add(
          "selecionado"
        );

        dataSelecionada =
          dataFormatada;

        document
          .getElementById(
            "dataSelecionada"
          ).value =
          dataFormatada;

        carregarHorarios();

      };

    } else {

      item.className =
        "dia indisponivel";

    }

    grade.appendChild(item);

  }

  container.appendChild(
    grade
  );

}

  const { data, error } =
    await supabaseClient
      .from("datas_disponiveis")
      .select("*")
      .eq("ativa", true)
      .order("data");

  if (error) {
    console.error(error);
    return;
  }

  dataSelect.innerHTML =
    '<option value="">Selecione a data</option>';

  data.forEach(item => {

    dataSelect.innerHTML += `
      <option value="${item.data}">
        ${item.data}
      </option>
    `;

  });

}

async function carregarHorarios() {

  const dataEscolhida =
    dataSelecionada;

  horarioSelect.innerHTML =
    '<option>Carregando...</option>';

  const { data: dataInfo } =
    await supabaseClient
      .from("datas_disponiveis")
      .select("*")
      .eq("data", dataEscolhida)
      .single();

  if (!dataInfo) return;

  const { data: horarios } =
    await supabaseClient
      .from("horarios")
      .select("*")
      .eq("data_id", dataInfo.id)
      .eq("disponivel", true)
      .order("horario");

  horarioSelect.innerHTML =
    '<option value="">Selecione o horário</option>';

  horarios.forEach(item => {

    horarioSelect.innerHTML += `
      <option value="${item.horario}">
        ${item.horario}
      </option>
    `;

  });

}

dataSelect.addEventListener(
  "change",
  carregarHorarios
);

document
  .getElementById("agendamentoForm")
  .addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      const responsavel =
        document.getElementById("responsavel").value;

      const telefone =
        document.getElementById("telefone").value;

      const email =
        document.getElementById("email").value;

      const aluno =
        document.getElementById("aluno").value;

      const turma =
        document.getElementById("turma").value;

      const data =
        dataSelect.value;

      const horario =
        horarioSelect.value;

      const { error } =
        await supabaseClient
          .from("agendamentos")
          .insert([
            {
              responsavel,
              telefone,
              email,
              aluno,
              turma,
              data,
              horario
            }
          ]);

      if (error) {

        console.error(error);

        mensagem.innerHTML =
          "Erro ao salvar o agendamento.";

        return;

      }

      mensagem.innerHTML =
        "Visita agendada com sucesso!";

      const texto =
`Olá! Gostaria de confirmar uma visita ao Colégio Japi.

Responsável: ${responsavel}
Aluno: ${aluno}
Turma: ${turma}
Data: ${data}
Horário: ${horario}
Telefone: ${telefone}`;

      const url =
        "https://wa.me/5511963102191?text=" +
        encodeURIComponent(texto);

      setTimeout(() => {

        window.open(
          url,
          "_blank"
        );

      }, 1000);

      document
        .getElementById("agendamentoForm")
        .reset();

    }
  );

carregarDatas();
