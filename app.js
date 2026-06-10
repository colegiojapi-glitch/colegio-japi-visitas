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
let dataIdSelecionada = null;
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
    data.map(item =>
      String(item.data).substring(0, 10)
    );

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

  if (!container) return;

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
      .querySelectorAll(".dia")
      .forEach(d =>
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

        document
          .querySelectorAll(".dia")
          .forEach(d =>
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

async function carregarHorarios() 

  if (!dataSelecionada)
    return;

  horarioSelect.innerHTML =
    '<option>Carregando...</option>';

  const { data: dataInfo, error } =
    await supabaseClient
      .from("datas_disponiveis")
      .select("*")
      .eq("data", dataSelecionada)
      .single();

  if (error || !dataInfo) {
    console.error(error);
    return;
  }

  dataIdSelecionada =
    dataInfo.id;

  const { data: horarios } =
    await supabaseClient
      .from("horarios")
      .select("*")
      .eq("data_id", dataIdSelecionada)
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

document
  .getElementById("agendamentoForm")
  .addEventListener(
    "submit",
    async (e) => {

      e.preventDefault();

      if (!dataSelecionada) {

        mensagem.innerHTML =
          "Selecione uma data.";

        return;
      }

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
              data: dataSelecionada,
              horario
            }
          ]);

      if (error) {

        console.error(error);

        mensagem.innerHTML =
          "Erro ao salvar o agendamento.";

        return;
      }

      const { error: erroBloqueio } =
        await supabaseClient
          .from("horarios")
          .update({
            disponivel: false
          })
          .eq(
            "data_id",
            dataIdSelecionada
          )
          .eq(
            "horario",
            horario
          );

      if (erroBloqueio) {
        console.error(
          erroBloqueio
        );
      }

      mensagem.innerHTML =
        "Visita agendada com sucesso!";

      const texto =
`Olá! Gostaria de confirmar uma visita ao Colégio Japi.

Responsável: ${responsavel}
Aluno: ${aluno}
Turma: ${turma}
Data: ${dataSelecionada}
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

      await carregarHorarios();

    }
  );

carregarDatas();
