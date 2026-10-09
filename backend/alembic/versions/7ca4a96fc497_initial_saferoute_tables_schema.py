"""Initial SafeRoute tables schema

Revision ID: 7ca4a96fc497
Revises: 
Create Date: 2026-10-10 03:04:03.540189

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7ca4a96fc497'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Sources
    op.create_table(
        'sources',
        sa.Column('id', sa.String(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('base_url', sa.String(), nullable=True),
        sa.Column('geographic_coverage', sa.String(), nullable=False),
        sa.Column('authority_level', sa.String(), nullable=False),
        sa.Column('last_attempt_at', sa.DateTime(), nullable=True),
        sa.Column('last_success_at', sa.DateTime(), nullable=True),
        sa.Column('health_status', sa.String(), server_default='healthy'),
        sa.Column('attribution_text', sa.String(), nullable=False)
    )

    # 2. Areas
    op.create_table(
        'areas',
        sa.Column('id', sa.String(), primary_key=True, index=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('state_region', sa.String(), nullable=False),
        sa.Column('center_lat', sa.Float(), nullable=False),
        sa.Column('center_lng', sa.Float(), nullable=False),
        sa.Column('default_zoom', sa.Integer(), server_default='11'),
        sa.Column('boundary_geojson', sa.Text(), nullable=True)
    )

    # 3. Alerts
    op.create_table(
        'alerts',
        sa.Column('id', sa.String(), primary_key=True, index=True),
        sa.Column('source_id', sa.String(), sa.ForeignKey('sources.id'), nullable=False),
        sa.Column('external_id', sa.String(), nullable=True),
        sa.Column('area_id', sa.String(), sa.ForeignKey('areas.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description_original', sa.Text(), nullable=False),
        sa.Column('instruction_original', sa.Text(), nullable=True),
        sa.Column('original_language', sa.String(), server_default='en'),
        sa.Column('hazard_type', sa.String(), nullable=False),
        sa.Column('severity', sa.String(), nullable=False),
        sa.Column('status', sa.String(), server_default='active'),
        sa.Column('issued_at', sa.DateTime(), nullable=True),
        sa.Column('effective_at', sa.DateTime(), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('retrieved_at', sa.DateTime(), nullable=True),
        sa.Column('source_url', sa.String(), nullable=True),
        sa.Column('verification_status', sa.String(), server_default='official_source'),
        sa.Column('is_simulated', sa.Boolean(), server_default='false'),
        sa.Column('lat', sa.Float(), nullable=True),
        sa.Column('lng', sa.Float(), nullable=True),
        sa.Column('polygon_geojson', sa.Text(), nullable=True)
    )

    # 4. Safe Zones
    op.create_table(
        'safe_zones',
        sa.Column('id', sa.String(), primary_key=True, index=True),
        sa.Column('area_id', sa.String(), sa.ForeignKey('areas.id'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('facility_type', sa.String(), nullable=False),
        sa.Column('address', sa.String(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('source_name', sa.String(), nullable=False),
        sa.Column('source_url', sa.String(), nullable=True),
        sa.Column('verification_status', sa.String(), server_default='official_verified'),
        sa.Column('last_verified_at', sa.DateTime(), nullable=True),
        sa.Column('operational_status', sa.String(), server_default='open'),
        sa.Column('capacity_notes', sa.String(), nullable=True),
        sa.Column('contact_phone', sa.String(), nullable=True),
        sa.Column('is_simulated', sa.Boolean(), server_default='false')
    )

    # 5. Translations
    op.create_table(
        'translations',
        sa.Column('id', sa.String(), primary_key=True, index=True),
        sa.Column('alert_id', sa.String(), sa.ForeignKey('alerts.id'), nullable=False),
        sa.Column('target_language', sa.String(), nullable=False),
        sa.Column('translated_title', sa.String(), nullable=False),
        sa.Column('translated_description', sa.Text(), nullable=False),
        sa.Column('translated_instruction', sa.Text(), nullable=True),
        sa.Column('provider', sa.String(), server_default='SafeRoute Linguistic Engine'),
        sa.Column('source_text_hash', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )

    # 6. Emergency Contacts
    op.create_table(
        'emergency_contacts',
        sa.Column('id', sa.String(), primary_key=True, index=True),
        sa.Column('area_id', sa.String(), sa.ForeignKey('areas.id'), nullable=False),
        sa.Column('service_name', sa.String(), nullable=False),
        sa.Column('phone_number', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('source_url', sa.String(), nullable=True),
        sa.Column('is_toll_free', sa.Boolean(), server_default='true')
    )

    # 7. Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(), primary_key=True, index=True),
        sa.Column('username', sa.String(), unique=True, index=True, nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('role', sa.String(), server_default='editor'),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )

    # 8. Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(), primary_key=True, index=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('entity_type', sa.String(), nullable=False),
        sa.Column('entity_id', sa.String(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('details_json', sa.Text(), nullable=True)
    )


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('users')
    op.drop_table('emergency_contacts')
    op.drop_table('translations')
    op.drop_table('safe_zones')
    op.drop_table('alerts')
    op.drop_table('areas')
    op.drop_table('sources')
