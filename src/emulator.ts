import { moveMessagePortToContext } from 'worker_threads';

export enum CpuPart {
    M6809,
    H6309,
}

export enum ConditionCodes {
    Carry = 1,
    Overflow = 2,
    Zero = 4,
    Negative = 8,
    Interrupt = 16,
    HalfCarry = 32,
    FastInterrupt = 64,
    Entire = 128
}

export enum OpCodes {
    Swi = 0x3F,
    LdaDirect = 0x96,
    StaDirect = 0x97,
}

export class Memory {
    private readonly maxMemory = 64 * 1024;
    public data = new Array<number>(this.maxMemory);

    constructor() {
        for(let i = 0; i < this.maxMemory; i++) {
            this.data[i] = 0;
        }
    }
}

export class Cpu {
    pc: number = 0xFFFF;
    dp: number = 0x00;
    cc: ConditionCodes = 0x00;

    a: number = 0x00;
    b: number = 0x00;
    s: number = 0x100;
    u: number = 0x200;
    x: number = 0x0000;
    y: number = 0x0000;


    private cycles: number = 0;

    constructor(public part: CpuPart, public memory: Memory) {
    }
    public reset(): void {
        this.pc = (this.memory.data[0xFFFE] << 8) | this.memory.data[0xFFFF];
        this.dp = 0x00;
        this.cc = ConditionCodes.FastInterrupt | ConditionCodes.Interrupt;
    }

    public fetchByte(location: number): number {
        this.cycles--;
        return this.memory.data[location];
    }

    public storeByte(location: number, value: number): void {
        this.cycles--;
        this.memory.data[location] = value;
    }

    public execute(cycles: number): number {
        this.cycles = cycles;

        while (this.cycles > 0) {
            const opcode = this.fetchByte(this.pc++);
            switch(opcode) {
                case OpCodes.LdaDirect: {
                    const offset = this.fetchByte(this.pc++);
                    if (this.part == CpuPart.M6809) this.cycles--;
                    const addr = this.dp + offset;
                    this.a = this.fetchByte(addr);
                }
                break;
                case OpCodes.StaDirect: {
                    const offset = this.fetchByte(this.pc++);
                    if (this.part == CpuPart.M6809) this.cycles--;
                    const addr = this.dp + offset;
                    this.storeByte(addr, this.a);
                }
                break;
                default:
                    return this.cycles;
            }
        }
        return this.cycles;
    }
}
