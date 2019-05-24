// Generated by dts-bundle v0.7.3

export class Deflate {
    static compress(input: Array<number> | Uint8Array, opt_params: any): any;
    static DefaultBufferSize: number;
    constructor(input: Array<number> | Uint8Array, opt_params?: any);
    compress(): any;
}

export class Inflate {
    constructor(input: Array<number> | Uint8Array, opt_params?: any);
    decompress(): any;
}

