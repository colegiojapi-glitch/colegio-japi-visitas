const SUPABASE_URL =
"https://nvrxwausxepoikcdxule.supabase.co";

const SUPABASE_KEY =
"sb_publishable_u5pOZTC_-KTvXHJdL1rIIA_X_KSM1CT";

const supabaseClient =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);
(async () => {

const {
  data: { session }
} =
await supabaseClient.auth.getSession();

if (!session) {

  window.location.href =
  "login.html";

  return;

}

})();

const lista =
document.getElementById(
"listaAgendamentos"
);

const listaDatas =
document.getElementById(
"listaDatas"
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
.eq("id", id);

carregarAgendamentos();

}

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

});

}

async function criarData() {

const dataNova =
document.getElementById(
"novaData"
).value;

if (!dataNova) {

alert(
"Selecione uma data."
);

return;

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

  console.error(error);

  alert(
    JSON.stringify(error)
  );

  return;
}

const horariosPadrao = [
"10:00",
"11:00",
"13:30",
"14:00",
"14:30",
"15:00",
"16:00",
"17:00"
];

const horarios =
horariosPadrao.map(
horario => ({
data_id: data.id,
horario,
disponivel: true
})
);

const { error: erroHorario } =
await supabaseClient
.from("horarios")
.insert(horarios);

if (erroHorario) {

  console.error(erroHorario);

  alert(
    JSON.stringify(erroHorario)
  );

  return;
}

if (erroHorario) {
  console.error(
    "ERRO HORARIOS:",
    erroHorarios
  );

  alert(
    JSON.stringify(
      erroHorarios,
      null,
      2
    )
  );

  return;
}

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

async function logout() {

await supabaseClient.auth.signOut();

window.location.href =
"login.html";

}

async function exportarExcel() {

const { data, error } =
await supabaseClient
.from("agendamentos")
.select("*")
.order("data")
.order("horario");

if (error) {

  alert(
    "Erro ao carregar agendamentos."
  );

  return;
}

const planilha =
XLSX.utils.json_to_sheet(
  data.map(item => ({
    Data: item.data,
    Horário: item.horario,
    Responsável: item.responsavel,
    Aluno: item.aluno,
    Turma: item.turma,
    Telefone: item.telefone
  }))
);

const workbook =
XLSX.utils.book_new();

XLSX.utils.book_append_sheet(
  workbook,
  planilha,
  "Agendamentos"
);

XLSX.writeFile(
  workbook,
  "agendamentos.xlsx"
);

}

carregarAgendamentos();
carregarDatasAdmin();
