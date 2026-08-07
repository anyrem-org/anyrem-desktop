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
          className="size-[20px] cursor-default rounded-full bg-white shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black"
          value="default"
          id="r1"
        >
          <RadioGroupIndicator className="relative flex size-full items-center justify-center after:block after:size-[11px] after:rounded-full after:bg-violet11" />
        </RadioGroupItem>
        {/* <label className="pl-[15px] text-[15px] leading-none text-white" htmlFor="r1">
          Default
        </label> */}
      </div>
    </RadioGroupRoot>
  );
}
