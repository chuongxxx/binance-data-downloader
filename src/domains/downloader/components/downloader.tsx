"use client";

import { Flex, Form, Select, Spin, Switch } from "antd";
import { useMemo, useState } from "react";

import { ISelectOption } from "@shared/interfaces/select.interface";
import { IGetDataParams } from "@domains/downloader/interfaces/binance.interface";
import {
  EInterval,
  ETradingStatus,
} from "@domains/downloader/enums/binance.enum";
import { enumToArray } from "@shared/utils/array.util";
import { useGetSymbols } from "@domains/downloader/hooks/use-symbols.hook";
import DownloadLog from "./download-log";

const intervalOptions: ISelectOption[] = enumToArray(EInterval);

const Downloader = () => {
  const [params, setParams] = useState<IGetDataParams>({
    interval: EInterval.One_Minute,
    symbol: "BTCUSDT",
    isAllSymbol: false,
  });

  const { data: symbols, isLoading } = useGetSymbols();

  const symbolOptions = useMemo(() => {
    const filteredSymbols = symbols.filter(
      (s) => s.status === ETradingStatus.Trading
    );
    return filteredSymbols.map((s: { symbol: string }) => ({
      value: s.symbol,
      label: s.symbol,
    }));
  }, [symbols]);

  const handleValueChange = (key: string, value: unknown) => {
    setParams((p) => ({ ...p, [key]: value }));
  };

  if (isLoading) {
    return (
      <Flex justify={"center"} style={{ width: "100%" }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <Flex vertical={true}>
      <Form initialValues={params} layout="vertical">
        <Form.Item name="symbol" label="Symbol" rules={[{ required: true }]}>
          <Select
            defaultValue={symbolOptions[0].value ?? "BTCUSDT"}
            options={symbolOptions}
            onChange={(value) => handleValueChange("symbol", value)}
            showSearch
            disabled={params.isAllSymbol}
          />
        </Form.Item>
        <Form.Item
          name="isAllSymbol"
          label="Do you want to download all symbol?"
        >
          <Switch
            defaultChecked={false}
            onChange={(value) => handleValueChange("isAllSymbol", value)}
          />
        </Form.Item>
        <Form.Item
          name="interval"
          label="Interval"
          rules={[{ required: true }]}
        >
          <Select
            defaultValue={EInterval.One_Minute}
            options={intervalOptions}
            onChange={(value) => handleValueChange("interval", value)}
          />
        </Form.Item>
      </Form>
      <DownloadLog
        symbol={params.symbol}
        interval={params.interval}
        isAllSymbol={params.isAllSymbol}
      />
    </Flex>
  );
};

export default Downloader;
