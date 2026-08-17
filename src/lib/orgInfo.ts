// tel: 링크는 숫자만 받는다 — 표시용 전화번호(phone)에서 그때그때 계산해,
// 편집자가 표시 번호만 바꾸고 링크를 깜빡 안 맞추는 사고를 막는다.
export const telHref = (phone: string) => `tel:${phone.replace(/\D/g, '')}`;
