import { supabase } from "./supabaseClient";

export async function importarQuestoesSupabase(jsonData) {
  try {
    if (!Array.isArray(jsonData)) {
      return { success: false, message: "Formato inválido: esperado um array de questões." };
    }

    const questoesParaInserir = jsonData.map((q) => ({
      statement: q.statement || "",
      category: q.category || "Discursiva",
      alternatives: q.alternatives || null,
      correct_alternative: q.correct_alternative ?? null,
      answer_comment: q.answer_comment || null,
      item_model: q.item_model || "005 - DISCURSIVA",
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("questions")
      .insert(questoesParaInserir)
      .select();

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, inserted: Array.isArray(data) ? data.length : 0 };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
