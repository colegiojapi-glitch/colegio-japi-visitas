const SUPABASE_URL =
  "https://nvrxwausxepoikcdxule.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_u5pOZTC_-KTvXHJdL1rIIA_X_KSM1CT";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

const lista =
  document.getElementById(
    "listaAgendamentos"
  );

async function carregarAgendamentos() {

  const { data, error } =
    await supabaseClient
      .from("agendamentos")
      .select("*")
      .order("data")
      .order("horario");

  if (error) {
    console.error(error);
    return;
  }

  lista.innerHTML = "";

  data.forEach(item => {

    lista.innerHTML += `
      <tr>

        <td>${item.data}</td>

        <td>${item.horario}</td>

        <td>${item.responsavel}</td>

        <td>${item.aluno}</td>

        <td>${item.turma}</td>

        <td>${item.telefone}</td>

        <td>

          <button
            onclick="cancelarAgendamento(
              ${item.id},
              '${item.data}',
              '${item.horario}'
            )"
          >
            Cancelar
          </button>

        </td>

      </tr>
    `;

  });

}

async function cancelarAgendamento(
  id,
  data,
  horario
) {

  if (
    !confirm(
      "Cancelar este agendamento?"
    )
  ) {
    return;
  }

  const { data: dataInfo } =
    await supabaseClient
      .from("datas_disponiveis")
      .select("*")
      .eq("data", data)
      .single();

  if (!dataInfo) {
    alert(
      "Data não encontrada."
    );
    return;
  }

  await supabaseClient
    .from("horarios")
    .update({
      disponivel: true
    })
    .eq(
      "data_id",
      dataInfo.id
    )
    .eq(
      "horario",
      horario
    );

  await supabaseClient
    .from("agendamentos")
    .delete()
    .eq(
      "id",
      id
    );

  carregarAgendamentos();

}

carregarAgendamentos();
