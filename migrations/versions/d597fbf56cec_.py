"""empty message

Revision ID: d597fbf56cec
Revises: 
Create Date: 2024-05-03 08:36:42.547213

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd597fbf56cec'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=64), nullable=True),
    sa.Column('email', sa.String(length=120), nullable=True),
    sa.Column('password_hash', sa.String(length=128), nullable=True),
    sa.Column('last_login', sa.DateTime(), nullable=True),
    sa.Column('points_as_creator', sa.Integer(), nullable=True),
    sa.Column('points_as_guesser', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_user_email'), ['email'], unique=True)
        batch_op.create_index(batch_op.f('ix_user_username'), ['username'], unique=True)

    op.create_table('word',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('category', sa.Text(), nullable=True),
    sa.Column('text', sa.Text(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('word', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_word_text'), ['text'], unique=True)

    op.create_table('drawing',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('word_id', sa.Integer(), nullable=True),
    sa.Column('creator_id', sa.Integer(), nullable=True),
    sa.Column('drawing_data', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['creator_id'], ['user.id'], ),
    sa.ForeignKeyConstraint(['word_id'], ['word.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('drawing', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_drawing_creator_id'), ['creator_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_drawing_word_id'), ['word_id'], unique=False)

    op.create_table('guess',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('drawing_id', sa.Integer(), nullable=True),
    sa.Column('guesser_id', sa.Integer(), nullable=True),
    sa.Column('is_correct', sa.Boolean(), nullable=True),
    sa.Column('points_for_creator', sa.Integer(), nullable=True),
    sa.Column('points_for_guesser', sa.Integer(), nullable=True),
    sa.Column('time_shown', sa.DateTime(), nullable=True),
    sa.Column('time_guessed', sa.DateTime(), nullable=True),
    sa.Column('time_taken', sa.Float(), nullable=True),
    sa.ForeignKeyConstraint(['drawing_id'], ['drawing.id'], ),
    sa.ForeignKeyConstraint(['guesser_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('guess', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_guess_drawing_id'), ['drawing_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_guess_guesser_id'), ['guesser_id'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('guess', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_guess_guesser_id'))
        batch_op.drop_index(batch_op.f('ix_guess_drawing_id'))

    op.drop_table('guess')
    with op.batch_alter_table('drawing', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_drawing_word_id'))
        batch_op.drop_index(batch_op.f('ix_drawing_creator_id'))

    op.drop_table('drawing')
    with op.batch_alter_table('word', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_word_text'))

    op.drop_table('word')
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_user_username'))
        batch_op.drop_index(batch_op.f('ix_user_email'))

    op.drop_table('user')
    # ### end Alembic commands ###