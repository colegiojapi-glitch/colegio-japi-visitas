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
const listaDatas =
document.getElementById(
"listaDatas"
);

async function carregarDatasAdmin() {

const { data, error } =
await supabaseClient
.from("datas_disponiveis")
.select("*")
.order("data");

if (error) {
console.error(error);
return;
}

listaDatas.innerHTML = "";

data.forEach(item => {

```
listaDatas.innerHTML += `
  <tr>

    <td>${item.data}</td>

    <td>
      ${item.ativa ? "✅ Ativa" : "❌ Inativa"}
    </td>

    <td>

      <button
        onclick="alterarStatusData(
          ${item.id},
          ${item.ativa}
        )"
      >
        ${item.ativa ? "Desativar" : "Ativar"}
      </button>

    </td>

  </tr>
`;
```

});

}

async function criarData() {

const dataNova =
document.getElementById(
"novaData"
).value;

if (!dataNova) {

```
alert(
  "Selecione uma data."
);

return;
```

}

const { data, error } =
await supabaseClient
.from("datas_disponiveis")
.insert([
{
data: dataNova,
ativa: true
}
])
.select()
.single();

if (error) {

```
console.error(error);

alert(
  "Erro ao criar data."
);

return;
```

}

const horariosPadrao = [

```
"10:00",
"11:00",
"13:30",
"14:00",
"14:30",
"15:00",
"16:00",
"17:00"
```

];

const horarios =
horariosPadrao.map(
horario => ({
data_id: data.id,
horario,
disponivel: true
})
);

await supabaseClient
.from("horarios")
.insert(horarios);

carregarDatasAdmin();

alert(
"Data criada com sucesso."
);

}

async function alterarStatusData(
id,
statusAtual
) {

await supabaseClient
.from("datas_disponiveis")
.update({
ativa: !statusAtual
})
.eq("id", id);

carregarDatasAdmin();

}

carregarAgendamentos();
carregarDatasAdmin();
