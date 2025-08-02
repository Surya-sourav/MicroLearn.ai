"""add_quiz_models_manual

Revision ID: add_quiz_models_manual
Revises: 7dff3a305e14
Create Date: 2025-08-02 21:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_quiz_models_manual'
down_revision: Union[str, None] = '7dff3a305e14'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create quizzes table
    op.create_table('quizzes',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.VARCHAR(), nullable=False),
        sa.Column('description', sa.TEXT(), nullable=True),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('space_ids', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('question_count', sa.INTEGER(), nullable=True),
        sa.Column('difficulty', sa.VARCHAR(), nullable=True),
        sa.Column('time_limit', sa.INTEGER(), nullable=True),
        sa.Column('questions', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', postgresql.TIMESTAMP(), nullable=True),
        sa.Column('is_active', sa.BOOLEAN(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='quizzes_user_id_fkey'),
        sa.PrimaryKeyConstraint('id', name='quizzes_pkey')
    )
    
    # Create quiz_attempts table
    op.create_table('quiz_attempts',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('quiz_id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('started_at', postgresql.TIMESTAMP(), nullable=True),
        sa.Column('completed_at', postgresql.TIMESTAMP(), nullable=True),
        sa.Column('time_taken', sa.INTEGER(), nullable=True),
        sa.Column('score', sa.DOUBLE_PRECISION(precision=53), nullable=True),
        sa.Column('total_questions', sa.INTEGER(), nullable=True),
        sa.Column('correct_answers', sa.INTEGER(), nullable=True),
        sa.Column('answers', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['quiz_id'], ['quizzes.id'], name='quiz_attempts_quiz_id_fkey'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='quiz_attempts_user_id_fkey'),
        sa.PrimaryKeyConstraint('id', name='quiz_attempts_pkey')
    )


def downgrade() -> None:
    # Drop quiz_attempts table first (due to foreign key constraint)
    op.drop_table('quiz_attempts')
    # Drop quizzes table
    op.drop_table('quizzes') 