import { toast } from 'sonner';

/**
 * Копирует текст в буфер обмена и показывает уведомление
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    
    toast.success(<>Скопировано:<br/>{text}</>);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    toast.error('Не удалось скопировать в буфер обмена');
    return false;
  }
}
