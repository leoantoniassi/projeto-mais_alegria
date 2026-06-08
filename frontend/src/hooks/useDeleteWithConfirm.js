import { useConfirm } from '../contexts/ConfirmContext';
import api from '../services/api';

export default function useDeleteWithConfirm() {
  const confirm = useConfirm();

  const executeDelete = async (id, endpoint, entityDisplayName, refetch) => {
    if (!(await confirm(`Excluir ${entityDisplayName.toLowerCase()}?`))) return null;

    try {
      const { data: res } = await api.delete(`${endpoint}/${id}`);

      if (res.warning && res.requiresConfirmation) {
        if (!(await confirm(res.message, { title: 'Aviso', isDanger: true }))) return null;

        const { data: res2 } = await api.delete(`${endpoint}/${id}`, { params: { force: true } });

        const toast = res2.success
          ? { message: `${entityDisplayName} removido com sucesso!`, type: 'success' }
          : { message: res2.message, type: 'warning' };

        refetch();
        return toast;
      }

      const toast = { message: `${entityDisplayName} removido com sucesso!`, type: 'success' };
      refetch();
      return toast;
    } catch (err) {
      await confirm(err.response?.data?.message || 'Erro', { title: 'Erro', showCancel: false });
      return null;
    }
  };

  return { executeDelete };
}
