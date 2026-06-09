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
    dataSelect.value;

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
