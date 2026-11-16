import { useState } from "react"
import { useNavigate } from "react-router"
import { Field, Input, PageSkeleton, RadioGroup, RadioRow } from "@/shared/components"
import { GENDER_LABEL } from "@/shared/constants"
import { usePageMeta } from "@/shared/hooks"
import type { Gender } from "@/shared/types"
import { useEffect } from "react"
import { WizardFrame } from "./WizardFrame"
import { useCart } from "./useCart"

export default function StepGuest() {
  usePageMeta("Data tamu")
  const { w, c } = useCart()
  const navigate = useNavigate()
  const [touched, setTouched] = useState(false)
  const genders = c?.genders ?? []
  const single = genders.length === 1
  // Toko yang hanya melayani satu gender: pilihan gender dilewati dan terisi otomatis.
  useEffect(() => {
    if (single && w.gender !== genders[0]) w.patch({ gender: genders[0] })
  }, [single, genders, w])
  if (!c) return <PageSkeleton rows={3} />
  const nameMissing = !w.forSelf && w.guestName.trim().length < 2
  const canNext = !nameMissing && w.gender !== null
  return (
    <WizardFrame
      step={1}
      title="Untuk siapa booking ini?"
      canNext={canNext}
      onNext={() => {
        setTouched(true)
        if (canNext) navigate("/booking/layanan")
      }}
    >
      <RadioGroup
        value={w.forSelf ? "self" : "other"}
        onValueChange={(v) => w.patch({ forSelf: v === "self" })}
        aria-label="Untuk siapa"
        className="divide-y rounded-xl bg-white px-4 shadow-card"
      >
        <RadioRow value="self" label="Diri sendiri" />
        <RadioRow value="other" label="Untuk orang lain" />
      </RadioGroup>
      {!w.forSelf && (
        <Field
          label="Nama tamu"
          required
          error={touched && nameMissing ? "Nama tamu wajib diisi." : undefined}
        >
          <Input
            value={w.guestName}
            onChange={(e) => w.patch({ guestName: e.target.value })}
            autoComplete="off"
          />
        </Field>
      )}
      {!single && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-slate-700">Gender</legend>
          <RadioGroup
            value={w.gender ?? ""}
            onValueChange={(v) =>
              w.patch({
                gender: v as Gender,
                serviceIds: [],
                barberId: w.fromProfile ? w.barberId : null,
                date: null,
                time: null,
              })
            }
            aria-label="Gender"
            className="divide-y rounded-xl bg-white px-4 shadow-card"
          >
            {genders.map((g) => (
              <RadioRow key={g} value={g} label={GENDER_LABEL[g]} />
            ))}
          </RadioGroup>
        </fieldset>
      )}
    </WizardFrame>
  )
}
