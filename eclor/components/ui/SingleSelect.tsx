import React, { useMemo, useState } from "react";
import type { StylesConfig } from "react-select";
import {
  Platform,
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";

/* -------------------- Types & helpers -------------------- */
export type Option = {
  value: string | null;
  label: string;
  emoji?: string;
  color?: "green" | "red" | "amber" | "blue" | "slate" | "purple" | string;
};

export type SingleSelectProps = {
  options: Option[];
  value: Option["value"];
  onChange: (v: Option["value"]) => void;
  placeholder?: string;
  className?: string;   // web only
  isDisabled?: boolean;
  noOptionsText?: string;
};

function colorToBadge(color?: string) {
  switch (color) {
    case "green":  return { bg: "rgba(141, 233, 175, 1)", fg: "#065e27ff" };
    case "red":    return { bg: "rgba(254, 202, 202, 1)", fg: "#991B1B" };
    case "amber":  return { bg: "rgba(253, 190, 138, 1)", fg: "#ec7931ff" };
    case "blue":   return { bg: "rgba(106, 175, 253, 1)", fg: "#155ee6ff" };
    case "slate":  return { bg: "rgba(226, 232, 240, 1)", fg: "#0F172A" };
    case "purple": return { bg: "rgba(233,213,255,0.35)", fg: "#581C87" };
    default:       return { bg: "rgba(244,244,245,0.35)", fg: "#18181B" };
  }
}

/* -------------------- Web (react-select) -------------------- */
function WebSelect(props: SingleSelectProps) {
  // runtime requires (safe for native)
  const ReactSelect: any = useMemo(() => require("react-select").default, []);
  const RS: any = useMemo(() => require("react-select"), []);

  const stylesRS: StylesConfig<Option, false> = {
    control: (base) => ({
      ...base,
      border: "none",
      boxShadow: "none",
      minHeight: 36,
      cursor: "pointer",
      backgroundColor: "transparent",
      fontFamily: "Delight-Medium",
      fontSize: 14,
    }),
    valueContainer: (base) => ({ ...base, padding: 0 }),
    dropdownIndicator: (base) => ({ ...base, padding: "0 4px" }),
    menu: (base) => ({ ...base, zIndex: 1000 }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    option: (base, state) => ({
      ...base,
      cursor: "pointer",
      padding: 6,
      backgroundColor: state.isFocused ? "rgba(0,0,0,0.05)" : "transparent",
    }),
  };

  const formatOptionLabel = (data: Option) => {
    const c = colorToBadge(data.color);
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 999,
          background: c.bg,
          color: c.fg,
          fontWeight: 900,
          whiteSpace: "nowrap",
          fontFamily: "Delight-Medium",
        }}
      >
        {data.emoji ? <span style={{ fontSize: 16 }}>{data.emoji}</span> : null}
        <span>{data.label}</span>
      </div>
    );
  };

  const SingleValue = (svProps: any) => {
    const data: Option = svProps.data;
    const c = colorToBadge(data.color);
    return (
      <RS.components.SingleValue {...svProps}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 999,
            background: c.bg,
            color: c.fg,
            fontWeight: 900,
            whiteSpace: "nowrap",
            fontFamily: "Delight-Medium",
          }}
        >
          {data.emoji ? <span style={{ fontSize: 16 }}>{data.emoji}</span> : null}
          <span>{data.label}</span>
        </div>
      </RS.components.SingleValue>
    );
  };

  const current =
    useMemo(() => props.options.find((o) => o.value === props.value) || null, [
      props.options,
      props.value,
    ]);

  return (
    <ReactSelect
      options={props.options}
      value={current}
      onChange={(opt: any) => props.onChange(opt?.value ?? null)}
      placeholder={props.placeholder || ""}
      isSearchable={false}
      isClearable={false}
      isDisabled={props.isDisabled}
      className={props.className}
      components={{ IndicatorSeparator: () => null, SingleValue }}
      styles={stylesRS}
      formatOptionLabel={formatOptionLabel}
      noOptionsMessage={() => props.noOptionsText || "Aucune option"}
      menuPlacement="auto"
      menuPosition="fixed"
      menuPortalTarget={
        typeof document !== "undefined" ? (document.body as any) : undefined
      }
      getOptionValue={(o: Option) => String(o.value)}
      getOptionLabel={(o: Option) => o.label}
    />
  );
}

/* -------------------- Native (Modal picker) -------------------- */
function NativeSelect(props: SingleSelectProps) {
  const [open, setOpen] = useState(false);
  const current =
    useMemo(() => props.options.find((o) => o.value === props.value) || null, [
      props.options,
      props.value,
    ]);
  const c = colorToBadge(current?.color);

  return (
    <>
      <Pressable
        disabled={props.isDisabled}
        style={({ pressed }) => [
          stylesN.trigger,
          { opacity: props.isDisabled ? 0.5 : pressed ? 0.9 : 1 },
        ]}
        onPress={() => setOpen(true)}
      >
        {current ? (
          <View style={[stylesN.pill, { backgroundColor: c.bg }]}>
            {current.emoji ? (
              <Text style={[stylesN.emoji, { color: c.fg }]}>{current.emoji}</Text>
            ) : null}
            <Text style={[stylesN.pillText, { color: c.fg }]} numberOfLines={1}>
              {current.label}
            </Text>
          </View>
        ) : (
          <Text style={stylesN.placeholder}>{props.placeholder || ""}</Text>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={stylesN.backdrop} onPress={() => setOpen(false)} />
        <View style={stylesN.sheet}>
          <Text style={stylesN.title}>Sélectionner</Text>
          <ScrollView style={{ maxHeight: 320 }}>
            {props.options.map((opt, i) => {
              const col = colorToBadge(opt.color);
              const selected = opt.value === props.value;
              return (
                <Pressable
                  key={`${String(opt.value)}-${i}`}
                  onPress={() => {
                    props.onChange(opt.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    stylesN.row,
                    pressed && { opacity: 0.9 },
                    selected && { borderColor: col.fg },
                  ]}
                >
                  <View style={[stylesN.pill, { backgroundColor: col.bg }]}>
                    {opt.emoji ? (
                      <Text style={[stylesN.emoji, { color: col.fg }]}>{opt.emoji}</Text>
                    ) : null}
                    <Text style={[stylesN.pillText, { color: col.fg }]} numberOfLines={1}>
                      {opt.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={stylesN.closeBtn} onPress={() => setOpen(false)}>
            <Text style={stylesN.closeTxt}>Fermer</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

export default function SingleSelect(props: SingleSelectProps) {
  if (Platform.OS === "web") return <WebSelect {...props} />;
  return <NativeSelect {...props} />;
}

/* -------------------- Styles natif -------------------- */
const stylesN = StyleSheet.create({
  trigger: {
    minHeight: 36,
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  placeholder: { color: "rgba(255,255,255,0.75)", fontSize: 14 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  emoji: { fontSize: 16 },
  pillText: { fontSize: 14, fontWeight: "600" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    position: "absolute", left: 16, right: 16, top: 80,
    borderRadius: 14, padding: 12, backgroundColor: "rgba(255,255,255,0.98)",
  },
  title: { fontSize: 16, fontWeight: "800", marginBottom: 8, color: "#111" },
  row: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "rgba(0,0,0,0.08)" },
  closeBtn: {
    alignSelf: "flex-end", marginTop: 10, paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8, backgroundColor: "rgba(0,0,0,0.06)",
  },
  closeTxt: { color: "#111", fontWeight: "900" },
});