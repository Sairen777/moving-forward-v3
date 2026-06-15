export type AsciiBackgroundProfile = {
  readonly id: string;
  readonly meta: {
    readonly cols: number;
    readonly rows: number;
    readonly kCool: number;
    readonly chars: string;
    readonly palette: readonly string[];
    readonly generated: string;
    readonly source: string;
    readonly sourceFile: string;
  };
  readonly data: string;
  readonly render: {
    readonly font: string;
    readonly cellAspect: number;
    readonly tileRepeats: number;
  };
  readonly timing: {
    readonly startDelayMs: number;
    readonly frameMs: number;
    readonly motionRampMs: number;
  };
  readonly motion: {
    readonly maxBend: number;
    readonly arcDrop: number;
    readonly tipPower: number;
    readonly headLag: number;
    readonly gustBase: number;
    readonly gustAmplitude: number;
    readonly gustFrequency: number;
    readonly gustNestedAmplitude: number;
    readonly gustNestedFrequency: number;
    readonly waves: readonly [
      weight: number,
      temporalFrequency: number,
      spatialFrequency: number,
      phaseScale: number,
    ][];
  };
};
