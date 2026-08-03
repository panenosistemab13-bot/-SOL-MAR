/**
 * Função utilitária para moderar conteúdo usando a API do Gemini no servidor.
 */
export async function moderateContent(text: string): Promise<{ isSafe: boolean; reason: string | null }> {
  try {
    const response = await fetch('/api/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      throw new Error('Falha na moderação');
    }
    
    return await response.json();
  } catch (err) {
    console.warn('Erro ao moderar conteúdo:', err);
    // Em caso de erro na API, por segurança podemos ser permissivos ou restritivos.
    // Aqui seremos permissivos para não bloquear o app se o Gemini falhar momentaneamente,
    // mas o ideal seria logar isso para revisão manual.
    return { isSafe: true, reason: null };
  }
}
