import { USE_TYPEDARRAY } from './define/typedarray/hybrid';
import { RawDeflate } from './rawdeflate';
import { Adler32 } from './adler32';
import { CompressionMethod } from './zlib';

    export class Deflate {
        public static compress(input: Array<number> | Uint8Array, opt_params: any) {
            return (new Deflate(input, opt_params)).compress();
        }
        public static DefaultBufferSize = 0x8000;
        public static CompressionType = RawDeflate.CompressionType;
        
        private input: Array<number> | Uint8Array;
        private output: Array<number> | Uint8Array;
        private compressionType: number;
        private rawDeflate: RawDeflate;
        private rawDeflateOption = {};
        private prop: string;

        constructor(input: Array<number> | Uint8Array, opt_params: any) {
            this.input = input;
            this.output =
                        new (USE_TYPEDARRAY ? Uint8Array : Array)(Deflate.DefaultBufferSize);
            this.compressionType = Deflate.CompressionType.DYNAMIC;
            this.rawDeflateOption = {};
            
              // option parameters
            if (opt_params) {
                if (typeof opt_params['compressionType'] === 'number') {
                  this.compressionType = opt_params['compressionType'];
                }
            }
          
              // copy options
            for (let prop of opt_params) {
                this.rawDeflateOption[prop] = opt_params[prop];
            }
          
            // set raw-deflate output buffer
            this.rawDeflateOption['outputBuffer'] = this.output;
            this.rawDeflate = new RawDeflate(this.input, this.rawDeflateOption);
        }
        public compress() {
            /** @type {Zlib.CompressionMethod} */
            let cm;
            /** @type {number} */
            let cinfo;
            /** @type {number} */
            let cmf;
            /** @type {number} */
            let flg;
            /** @type {number} */
            let fcheck;
            /** @type {number} */
            let fdict;
            /** @type {number} */
            let flevel;
            /** @type {number} */
            let clevel;
            /** @type {number} */
            let adler;
            /** @type {boolean} */
            let error = false;
            /** @type {!(Array|Uint8Array)} */
            let output;
            /** @type {number} */
            let pos = 0;

            output = this.output;

            // Compression Method and Flags
            cm = CompressionMethod.DEFLATE;
            switch (cm) {
                case CompressionMethod.DEFLATE:
                cinfo = Math.LOG2E * Math.log(RawDeflate.WindowSize) - 8;
                break;
                default:
                throw new Error('invalid compression method');
            }
            cmf = (cinfo << 4) | cm;
            output[pos++] = cmf;

            // Flags
            fdict = 0;
            switch (cm) {
                case CompressionMethod.DEFLATE:
                switch (this.compressionType) {
                    case Deflate.CompressionType.NONE: flevel = 0; break;
                    case Deflate.CompressionType.FIXED: flevel = 1; break;
                    case Deflate.CompressionType.DYNAMIC: flevel = 2; break;
                    default: throw new Error('unsupported compression type');
                }
                break;
                default:
                throw new Error('invalid compression method');
            }
            flg = (flevel << 6) | (fdict << 5);
            fcheck = 31 - (cmf * 256 + flg) % 31;
            flg |= fcheck;
            output[pos++] = flg;

            // Adler-32 checksum
            adler = Adler32(this.input);

            this.rawDeflate.op = pos;
            output = this.rawDeflate.compress();
            pos = output.length;

            if (USE_TYPEDARRAY) {
                // subarray 分を元にもどす
                output = new Uint8Array(output.buffer);
                // expand buffer
                if (output.length <= pos + 4) {
                this.output = new Uint8Array(output.length + 4);
                this.output.set(output);
                output = this.output;
                }
                output = output.subarray(0, pos + 4);
            }

            // adler32
            output[pos++] = (adler >> 24) & 0xff;
            output[pos++] = (adler >> 16) & 0xff;
            output[pos++] = (adler >>  8) & 0xff;
            output[pos++] = (adler      ) & 0xff;

            return output;
        }
    }
