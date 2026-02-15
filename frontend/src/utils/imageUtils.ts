/**
 * Redimensiona e comprime uma imagem (Base64) para garantir que ela caiba nos limites do servidor.
 * @param base64Str String base64 da imagem original
 * @param maxWidth Largura máxima permitida
 * @param maxHeight Altura máxima permitida
 * @param quality Qualidade da compressão (0 a 1)
 * @returns Promise com a nova string base64
 */
export async function resizeImage(
  base64Str: string,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calcular novas dimensões mantendo o aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Não foi possível criar o contexto do canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Exportar para base64 com compressão JPEG (geralmente menor que PNG para fotos)
      // Se for logo com transparência, talvez PNG seja melhor, mas o objetivo aqui é reduzir tamanho.
      // Vamos tentar JPEG primeiro, se falhar ou se precisar de transparência poderíamos parametrizar.
      const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(resizedBase64);
    };
    img.onerror = (err) => reject(err);
  });
}
