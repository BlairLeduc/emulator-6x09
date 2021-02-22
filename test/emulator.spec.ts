import { Cpu, CpuPart, Memory, OpCodes } from '../src/emulator';

class Program {
    public static SimpleLdaSta(memory: Memory) {
        memory.data[0xFFFE] = 0x20;
        memory.data[0xFFFF] = 0x00;

        memory.data[0x0040] = 42;

        memory.data[0x2000] = OpCodes.LdaDirect;
        memory.data[0x2001] = 0x40;

        memory.data[0x2002] = OpCodes.StaDirect;
        memory.data[0x2003] = 0x41;

        memory.data[0x2004] = OpCodes.Swi;
    }
}
describe('Emulator', () => {
    it('Can create memory', () => {
        const memory = new Memory();

        expect(memory).toBeTruthy();
    });

    it('Can create cpu', () => {
        const memory = new Memory();
        const cpu = new Cpu(CpuPart.M6809, memory);

        expect(cpu).toBeTruthy();
    });

    it('Can run an empty program', () => {
        const memory = new Memory();
        const cpu = new Cpu(CpuPart.M6809, memory);

        Program.SimpleLdaSta(memory);
        cpu.reset();

        const cycles = cpu.execute(8);

        expect(cycles).toBe(0);
        expect(memory.data[0x41]).toBe(42);
    });
});