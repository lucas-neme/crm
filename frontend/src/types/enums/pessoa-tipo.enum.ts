export enum PessoaTipoEnum {
  FISICA = 'FISICA',
  JURIDICA = 'JURIDICA',
  ESTRANGEIRA = 'ESTRANGEIRA',
}

export const PESSOA_TIPO_OPTIONS = [
  { value: PessoaTipoEnum.FISICA, label: 'Física' },
  { value: PessoaTipoEnum.JURIDICA, label: 'Jurídica' },
  { value: PessoaTipoEnum.ESTRANGEIRA, label: 'Estrangeira' },
];
