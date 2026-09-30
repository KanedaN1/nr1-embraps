const apiKey = "AIzaSyACLhcrLifV9grqvLLaLIUBAUJaoBUzQ6g";
const projectId = "nr-1-embraps";

async function resetDb() {
  console.log("Iniciando limpeza do Firebase Firestore para o processo oficial do dia 01/10...");

  try {
    // 1. Resetar documento re_status/global_status (Libera todos os REs que já responderam)
    console.log("Resetando coleção 're_status' -> 'global_status'...");
    const urlStatus = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/re_status/global_status?key=${apiKey}`;
    const resStatus = await fetch(urlStatus, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `projects/${projectId}/databases/(default)/documents/re_status/global_status`,
        fields: {}
      })
    });

    if (resStatus.ok) {
      console.log("✅ Documento 'global_status' resetado com sucesso! Todos os REs foram liberados para responder novamente.");
    } else {
      console.warn("⚠️ Aviso ao resetar 'global_status':", resStatus.status, await resStatus.text());
    }

    console.log("\n=== LIMPEZA DE BANCO CONCLUÍDA COM SUCESSO FOR OFFICIAL RELEASE 01/10 ===");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar limpeza do banco:", error);
    process.exit(1);
  }
}

resetDb();
