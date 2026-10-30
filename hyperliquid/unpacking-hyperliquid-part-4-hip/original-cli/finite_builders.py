"""Supplemental finite-price guards; NOT an original published implementation.

Only adds finite Decimal checks, then delegates unchanged inputs to the preserved
original builders. No signing, networking, wallet handling, or protocol redesign.
"""
from decimal import Decimal
from typing import Any

from hip3_common import build_register_asset2_action, build_set_oracle_action


def _require_finite(value: str) -> None:
    if not Decimal(value).is_finite():
        raise ValueError("price must be finite")


def build_register_asset2_action_finite(**kwargs: Any) -> dict[str, Any]:
    """Original register builder keywords, plus a finite oracle_px requirement."""
    _require_finite(kwargs["oracle_px"])
    return build_register_asset2_action(**kwargs)


def build_set_oracle_action_finite(
    *,
    dex: str,
    oracle_pxs: dict[str, str],
    mark_pxs: list[dict[str, str]],
    external_perp_pxs: dict[str, str],
) -> dict[str, Any]:
    """Require finite prices in every map before original validation/building."""
    for prices in [oracle_pxs, external_perp_pxs, *mark_pxs]:
        for value in prices.values():
            _require_finite(value)
    return build_set_oracle_action(
        dex=dex, oracle_pxs=oracle_pxs, mark_pxs=mark_pxs,
        external_perp_pxs=external_perp_pxs,
    )
