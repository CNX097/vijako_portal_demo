import { useEffect } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { App, Button, DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { Proposal } from '../../types';
import { ORG, PROJECTS, getEmployee } from '../../data/org';
import { getTemplate, itemsTotal, type FieldDef, type MaterialItem } from '../../data/workflows';
import { planSteps } from '../../lib/workflow';
import { DATE_FMT, ISO, fmtMoney } from '../../lib/format';
import { useCurrentUser, useDemoStore } from '../../store/useDemoStore';

const moneyProps = {
  min: 0,
  step: 100000,
  style: { width: '100%' },
  formatter: (v?: number | string) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
  parser: (v?: string) => Number((v ?? '').replace(/\./g, '')),
  addonAfter: '₫',
};

function ItemsField() {
  return (
    <Form.List name="items" initialValue={[{ qty: 1 }]}>
      {(fields, { add, remove }) => (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10, marginBottom: 16 }}>
          {fields.map((f) => (
            <div key={f.key} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 4 }}>
              <Form.Item name={[f.name, 'name']} rules={[{ required: true, message: 'Tên vật tư' }]} style={{ flex: '1 1 180px', marginBottom: 8 }}>
                <Input placeholder="Tên vật tư, quy cách" />
              </Form.Item>
              <Form.Item name={[f.name, 'unit']} style={{ width: 80, marginBottom: 8 }}>
                <Input placeholder="ĐVT" />
              </Form.Item>
              <Form.Item name={[f.name, 'qty']} rules={[{ required: true, message: 'SL' }]} style={{ width: 90, marginBottom: 8 }}>
                <InputNumber min={0} placeholder="SL" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name={[f.name, 'price']} rules={[{ required: true, message: 'Đơn giá' }]} style={{ width: 170, marginBottom: 8 }}>
                <InputNumber<number> {...moneyProps} addonAfter={undefined} placeholder="Đơn giá (₫)" />
              </Form.Item>
              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(f.name)} disabled={fields.length === 1} aria-label="Xoá dòng" />
            </div>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => add({ qty: 1 })} block>
            Thêm dòng vật tư
          </Button>
        </div>
      )}
    </Form.List>
  );
}

/** Trả về control trực tiếp (không bọc component) để Form.Item gắn được value / onChange. */
function fieldInput(f: FieldDef) {
  switch (f.kind) {
    case 'text':
      return <Input placeholder={f.placeholder} />;
    case 'textarea':
      return <Input.TextArea rows={2} placeholder={f.placeholder} />;
    case 'money':
      return <InputNumber<number> {...moneyProps} />;
    case 'date':
      return <DatePicker format={DATE_FMT} style={{ width: '100%' }} />;
    case 'project':
      return <Select allowClear={!f.required} placeholder="Chọn công trình" options={PROJECTS.map((p) => ({ value: p.id, label: p.name }))} />;
    case 'select':
      return <Select options={f.options.map((o) => ({ value: o, label: o }))} />;
    case 'items':
      return null;
  }
}

export function ProposalForm({ templateCode, onClose, onCreated }: { templateCode?: string; onClose: () => void; onCreated: (p: Proposal) => void }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const me = useCurrentUser();
  const createProposal = useDemoStore((s) => s.createProposal);
  const tpl = templateCode ? getTemplate(templateCode) : undefined;

  const amountField = Form.useWatch('amount', form) as number | undefined;
  const projectId = Form.useWatch('projectId', form) as string | undefined;
  const items = Form.useWatch('items', form) as MaterialItem[] | undefined;

  useEffect(() => {
    if (!tpl) return;
    form.resetFields();
    // Người ở công trường: mặc định chọn sẵn công trình của mình
    form.setFieldsValue({ projectId: me.siteId !== 'VP' ? me.siteId : undefined, method: 'Chuyển khoản' });
  }, [tpl, form, me.siteId]);

  if (!tpl) return null;

  const amount = tpl.code === 'VAT_TU' ? itemsTotal(items) : amountField ?? 0;
  const preview = planSteps(tpl.workflow, { requesterId: me.id, amount, projectId: projectId || undefined }, ORG);

  const submit = async () => {
    const v = await form.validateFields();
    const data: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) data[k] = dayjs.isDayjs(val) ? (val as Dayjs).format(ISO) : val;
    const p = createProposal(tpl.code, data);
    message.success(`Đã gửi ${tpl.name.toLowerCase()} ${p.code}`);
    onCreated(p);
  };

  return (
    <Modal open title={tpl.name} okText="Gửi đề xuất" cancelText="Huỷ" onOk={submit} onCancel={onClose} destroyOnHidden width={720}>
      <Form form={form} layout="vertical" requiredMark="optional">
        {tpl.fields.map((f) =>
          f.kind === 'items' ? (
            <div key={f.name}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>{f.label}</div>
              <ItemsField />
            </div>
          ) : (
            <Form.Item key={f.name} name={f.name} label={f.label} rules={f.required ? [{ required: true, message: `Nhập ${f.label.toLowerCase()}` }] : undefined}>
              {fieldInput(f)}
            </Form.Item>
          ),
        )}
      </Form>
      <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
          <b>Luồng duyệt dự kiến</b>
          <span>Giá trị: <b>{fmtMoney(amount)}</b></span>
        </div>
        {preview.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', gap: 8, padding: '3px 0', opacity: s.status === 'skipped' ? 0.5 : 1 }}>
            <span className="muted">{i + 1}.</span>
            <span>
              <b>{s.name}</b>
              {s.approverId && <> — {getEmployee(s.approverId).name}</>}
              {s.note && <div className="muted" style={{ fontSize: 12 }}>{s.note}</div>}
            </span>
          </div>
        ))}
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Luồng tự thay đổi theo giá trị và công trình bạn chọn — cấu hình bởi quản trị viên, không cần lập trình.</div>
      </div>
    </Modal>
  );
}
