import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    // O webhook do Supabase envia o payload no formato { record: { ... }, old_record: { ... }, type: 'INSERT', table: 'reviews', ... }
    
    if (!record) {
      return new Response(JSON.stringify({ error: "No record found" }), { status: 400 })
    }

    const attractionsList = Array.isArray(record.attractions) ? record.attractions.join(', ') : 'Nenhuma';

    const emailBody = `
      Nova avaliação recebida!
      
      Atrações visitadas: ${attractionsList}
      Nome: ${record.nickname}
      Email: ${record.email}
      Nota: ${record.rating}/5 estrelas
      Título: ${record.title}
      
      Mensagem:
      ${record.body}
      
      Para aprovar ou rejeitar:
      https://riofuerdeutsche.de/admin
    `.trim()

    console.log("Novo review recebido:", record.nickname, "-", attractionsList)
    
    // TODO: Configurar provider de email (Resend, SendGrid, etc.)
    
    return new Response(JSON.stringify({ ok: true, message: "Notification logged" }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
})
