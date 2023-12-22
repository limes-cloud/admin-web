// rsa
import JsEncrypt from 'jsencrypt';

export class RsaUtil {
	private publicKey: string;

	private privateKey: string;

	constructor() {
		// 公钥
		this.publicKey = import.meta.env.VITE_PUBLIC_KEY;
		// 私钥
		this.privateKey = import.meta.env.VITE_PRIVATE_KEY;
	}

	encrypt(params: object | string): string | false {
		const Encrypt = new JsEncrypt();
		Encrypt.setPublicKey(this.publicKey);
		return Encrypt.encrypt(typeof params === 'object' ? JSON.stringify(params) : params);
	}

	decrypt(params: object | string) {
		const Decrypt = new JsEncrypt();
		Decrypt.setPrivateKey(this.privateKey);
		return Decrypt.decrypt(typeof params === 'object' ? JSON.stringify(params) : params);
	}
}

export default new RsaUtil();
