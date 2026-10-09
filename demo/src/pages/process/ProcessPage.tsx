import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, Col, Descriptions, Drawer, Row, Table, Tabs, Tag } from 'antd';
import { ApartmentOutlined, DragOutlined, PlusOutlined } from '@ant-design/icons';
import type { Proposal } from '../../types';
import { getEmployee, getSite } from '../../data/org';
import { PROCESS_TEMPLATES, getTemplate, itemsTotal, type FieldDef, type MaterialItem } from '../../data/workflows';
import { currentApprover } from '../../lib/workflow';
import { fmtDate, fmtDateTime, fmtMoney } from '../../lib/format';
import { seesAllRequests } from '../../lib/permissions';
import { ApprovalActions } from '../../components/ApprovalActions';
import { ApprovalFlow } from '../../components/ApprovalFlow';
import { PersonLine } from '../../components/Person';
import { WorkflowStatusTag } from '../../components/WorkflowStatusTag';
import { usePendingForMe } from '../../store/selectors';
import { useCurrentUser, useDemoStore } from '../../store/useDemoStore';
import { ProposalForm } from './ProposalForm';

function flowSummary(code: string) {
  return getTemplate(code)
    .workflow.steps.map((s) => (s.whenLabel ? `${s.name} (nếu ${s.whenLabel})` : s.name))
    .join(' → ');
}

function fieldValue(f: FieldDef, v: unknown) {
  if (v == null || v === '') return '—';
  switch (f.kind) {
    case 'money':
      return fmtMoney(Number(v));
    case 'date':
      return fmtDate(String(v));
    case 'project':
      return getSite(String(v)).name;
    case 'items': {
      const items = v as MaterialItem[];
      return (
        <Table<MaterialItem>
          size="small"
          pagination={false}
          rowKey={(_, i) => String(i)}
          dataSource={items}
          scroll={{ x: 560 }}
          columns={[
            { title: 'Vật tư', dataIndex: 'name' },
            { title: 'ĐVT', dataIndex: 'unit', width: 60 },
            { title: 'SL', dataIndex: 'qty', width: 60 },
            { title: 'Đơn giá', dataIndex: 'price', align: 'right', render: (n: number) => <span style={{ whiteSpace: 'nowrap' }}>{fmtMoney(n)}</span> },
            { title: 'Thành tiền', key: 't', align: 'right', render: (_, it) => <span style={{ whiteSpace: 'nowrap' }}>{fmtMoney((it.qty ?? 0) * (it.price ?? 0))}</span> },
          ]}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4}><b>Tổng cộng</b></Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right"><b style={{ whiteSpace: 'nowrap' }}>{fmtMoney(itemsTotal(items))}</b></Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      );
    }
    default:
      return String(v);
  }
}

export function ProcessPage() {
  const me = useCurrentUser();
  const proposals = useDemoStore((s) => s.proposals);
  const actProposal = useDemoStore((s) => s.actProposal);
  const pending = usePendingForMe();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<string>();
  const openId = params.get('open');
  const newCode = params.get('new') ?? undefined;
  const selected = proposals.find((p) => p.id === openId);
  const mine = useMemo(() => proposals.filter((p) => p.requesterId === me.id), [proposals, me.id]);

  const setParam = (k: string, v?: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  const table = (rows: Proposal[]) => (
    <Table<Proposal>
      rowKey="id"
      dataSource={rows}
      pagination={false}
      scroll={{ x: 1100 }}
      locale={{ emptyText: 'Chưa có đề xuất' }}
      onRow={(p) => ({ onClick: () => setParam('open', p.id), style: { cursor: 'pointer' } })}
      columns={[
        { title: 'Mã', dataIndex: 'code', width: 120 },
        { title: 'Loại', key: 't', width: 200, render: (_, p) => <Tag color={getTemplate(p.templateCode).color}>{getTemplate(p.templateCode).name}</Tag> },
        { title: 'Nội dung', dataIndex: 'title', ellipsis: true },
        { title: 'Người đề xuất', key: 'r', width: 210, render: (_, p) => <PersonLine id={p.requesterId} size={28} /> },
        { title: 'Giá trị', dataIndex: 'amount', width: 140, align: 'right', render: (n: number) => fmtMoney(n) },
        { title: 'Trạng thái', key: 's', width: 110, render: (_, p) => <WorkflowStatusTag status={p.workflow.status} /> },
        { title: 'Đang chờ', key: 'a', width: 150, render: (_, p) => { const a = currentApprover(p.workflow); return a ? getEmployee(a).name : '—'; } },
      ]}
    />
  );

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Quy trình</h1>
          <div className="sub">Đề xuất & phê duyệt theo biểu mẫu và luồng duyệt cấu hình được</div>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {PROCESS_TEMPLATES.map((t) => (
          <Col key={t.code} xs={24} md={12} xl={6}>
            <Card style={{ height: '100%' }} styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%' } }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <span className="launcher-icon" style={{ background: `${t.color}14`, color: t.color, width: 40, height: 40, fontSize: 18 }}><ApartmentOutlined /></span>
                <b>{t.name}</b>
              </div>
              <div className="muted" style={{ fontSize: 13 }}>{t.description}</div>
              <div style={{ fontSize: 12, margin: '8px 0 12px', flex: 1 }}><span className="muted">Luồng duyệt:</span> {flowSummary(t.code)}</div>
              <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => setParam('new', t.code)}>Tạo đề xuất</Button>
            </Card>
          </Col>
        ))}
        <Col xs={24} md={12} xl={6}>
          <Card style={{ height: '100%', borderStyle: 'dashed', background: '#fafbfc' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <span className="launcher-icon" style={{ background: '#f3f4f6', color: '#6b7280', width: 40, height: 40, fontSize: 18 }}><DragOutlined /></span>
              <b>Thiết kế quy trình mới</b>
            </div>
            <div className="muted" style={{ fontSize: 13 }}>
              Bản chính thức: quản trị viên kéo thả biểu mẫu, đặt điều kiện rẽ nhánh và người duyệt (theo quản lý, chức danh, vai trò dự án) — ví dụ công tác phí, đề xuất sửa chữa, quy trình ISO.
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={tab ?? (pending.proposals.length ? 'approve' : 'mine')}
          onChange={setTab}
          items={[
            { key: 'mine', label: `Đề xuất của tôi (${mine.length})`, children: table(mine) },
            { key: 'approve', label: `Cần tôi duyệt (${pending.proposals.length})`, children: table(pending.proposals) },
            ...(seesAllRequests(me) ? [{ key: 'all', label: `Tất cả (${proposals.length})`, children: table(proposals) }] : []),
          ]}
        />
      </Card>

      {newCode && PROCESS_TEMPLATES.some((t) => t.code === newCode) && (
        <ProposalForm
          templateCode={newCode}
          onClose={() => setParam('new')}
          onCreated={(p) => {
            const next = new URLSearchParams(params);
            next.delete('new');
            next.set('open', p.id);
            setParams(next, { replace: true });
            setTab('mine');
          }}
        />
      )}

      <Drawer
        open={!!selected}
        width={640}
        onClose={() => setParam('open')}
        title={selected ? `${getTemplate(selected.templateCode).name} · ${selected.code}` : ''}
        extra={selected && <WorkflowStatusTag status={selected.workflow.status} />}
      >
        {selected && (
          <>
            <PersonLine id={selected.requesterId} size={40} sub={`Gửi lúc ${fmtDateTime(selected.createdAt)}`} />
            <Descriptions
              column={1}
              size="small"
              bordered
              style={{ marginTop: 16 }}
              styles={{ label: { width: 170 } }}
              items={[
                ...getTemplate(selected.templateCode)
                  .fields.filter((f) => f.kind !== 'items')
                  .map((f) => ({ key: f.name, label: f.label, children: fieldValue(f, selected.data[f.name]) })),
                { key: 'total', label: 'Giá trị đề xuất', children: <b>{fmtMoney(selected.amount)}</b> },
              ]}
            />
            {getTemplate(selected.templateCode)
              .fields.filter((f) => f.kind === 'items')
              .map((f) => (
                <div key={f.name} style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{f.label}</div>
                  {fieldValue(f, selected.data[f.name])}
                </div>
              ))}
            <div style={{ margin: '16px 0' }}>
              <ApprovalActions wf={selected.workflow} onAct={(a, c) => actProposal(selected.id, a, c)} />
            </div>
            <div style={{ fontWeight: 600 }}>Luồng duyệt</div>
            <ApprovalFlow wf={selected.workflow} requesterId={selected.requesterId} createdAt={selected.createdAt} slaHours={getTemplate(selected.templateCode).workflow.slaHours} />
          </>
        )}
      </Drawer>
    </>
  );
}
