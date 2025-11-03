"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { formatJalaliInput, parseJalaliInput, jalaliToIso, gregorianToJalali } from "@/lib/jalali-utils"

interface JalaliDateInputProps {
  value: string // ISO date string
  onChange: (isoDate: string) => void
  className?: string
}

export function JalaliDateInput({ value, onChange, className }: JalaliDateInputProps) {
  const [jalaliValue, setJalaliValue] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value)
        if (!Number.isNaN(date.getTime())) {
          const { jy, jm, jd } = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate())
          setJalaliValue(formatJalaliInput(jy, jm, jd))
        }
      } catch (error) {
        // handle invalid date value
      }
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setJalaliValue(input)
    setErrorMessage("")
  }

  const handleBlur = () => {
    const parsed = parseJalaliInput(jalaliValue)
    if (parsed) {
      const isoDate = jalaliToIso(parsed.jy, parsed.jm, parsed.jd)
      const selectedDate = new Date(isoDate)
      const today = new Date()

      // Set time to 00:00:00 for accurate date comparison
      today.setHours(0, 0, 0, 0)

      if (selectedDate > today) {
        setErrorMessage("تاریخ وارد شده نمی‌تواند در آینده باشد.")
        onChange("") // Clear the date if invalid
        return
      }

      onChange(isoDate)
    } else if (jalaliValue) {
      // if input is not empty and not valid
      setErrorMessage("فرمت تاریخ نامعتبر است.")
      onChange("")
    }
  }

  return (
    <div>
      <Input
        type="text"
        value={jalaliValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="1403/09/15"
        className={className}
        dir="ltr"
      />
      {errorMessage && <p className="text-right text-sm font-medium text-red-600 mt-1">{errorMessage}</p>}
    </div>
  )
}
