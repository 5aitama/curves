const DEG2RAD = 0.0174533;

export class Circle {
    private vBuf: Array<number>;
    private iBuf: Array<number>;
    
    constructor(radius = 1, resolution: number = 64) {
		const step = 360 / resolution;

		const vBuf = new Array(resolution * 6 + 1);
		const iBuf = new Array();

		vBuf[0] = 0;
		vBuf[1] = 0;
		vBuf[2] = 0;
		vBuf[3] = 1;
		vBuf[4] = 1;
		vBuf[5] = 1;

		for (let i = 1; i <= resolution; i++) {
			const angle = (i - 1) * step * DEG2RAD;

			const x = Math.sin(angle) * radius;
			const y = Math.cos(angle) * radius;
			const z = 0;
			const index = i * 6;

			vBuf[index    ] = x;
			vBuf[index + 1] = y;
			vBuf[index + 2] = z;
			vBuf[index + 3] = (i - 1) / resolution;
			vBuf[index + 4] = (i - 1) / resolution;
			vBuf[index + 5] = (i - 1) / resolution;
			
			if (i > 1) {
				iBuf.push(...[0, i - 1, i]);
			}
		}

		iBuf.push(...[0, 1, resolution]);

        this.vBuf = vBuf;
        this.iBuf = iBuf;
    }

    public get vertices() {
        return this.vBuf;
    }

    public get indices() {
        return this.iBuf;
    }

	public get element_count() {
		return this.vBuf.length / 6;
	}
}