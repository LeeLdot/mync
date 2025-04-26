import { db } from "./firebaseConfig.js";
import { ref, onValue } from "firebase/database";

export function escutarAtualizacoesViewer(codigoViewer, callback) {
  const codigoRef = ref(db, `codigos/${codigoViewer}`);
  onValue(codigoRef, callback);
}
