import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

export const RadioGroupRoot = RadioGroupPrimitive.Root;
export const RadioGroupItem = RadioGroupPrimitive.RadioGroupItem;
export const RadioGroupIndicator = RadioGroupPrimitive.RadioGroupIndicator;

export function RadioGroup() {
  return (
    <RadioGroupRoot
      className="flex flex-col gap-2.5"
      defaultValue="default"
      aria-label="View density"
    >
      <div className="flex items-center">
        <RadioGroupItem
          className="grid size-5 cursor-pointer place-items-center rounded-full border border-input bg-background outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
          value="default"
          id="r1"
        >
          <RadioGroupIndicator className="flex size-full items-center justify-center after:block after:size-2 after:rounded-full after:bg-primary-foreground" />
        </RadioGroupItem>
        {/* <label className="pl-[15px] text-[15px] leading-none text-white" htmlFor="r1">
          Default
        </label> */}
      </div>
    </RadioGroupRoot>
  );
}
