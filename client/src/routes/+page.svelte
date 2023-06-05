<script lang="ts">
	import { client, points } from '$lib/stores/socketStore';
	import buzz from '$lib/assets/buzzer.wav';
	import type { PointsData } from 'server/src/types/types';
	import { onMount } from 'svelte';

	let role: string;
	let pointList: PointsData[];
	let currentlyPlaying = false;

	client.onRoleReceived((r) => (role = r));
	points.subscribe((p) => (pointList = p));

	onMount(() => {
		let buzzer = new Audio(buzz);
		client.onBuzzerFired((_) => {
			buzzer.volume = 1;
			buzzer.play();
		});
	});

	function createGame() {
		client.createGame(gameId);
	}

	function joinGame() {
		client.joinGame(gameId, player);
	}

	function printGame() {
		client.printGame();
	}

	let gameId: string;
	let player: string;
	$: createDisabled = !(Boolean(gameId) && gameId.length > 0);
	$: playerDisabled = !(Boolean(player) && player.length > 0);
</script>

<div class="flex flex-col gap-5 items-center justify-center">
	{#if !role}
		<h1 class="text-xxl font-bold">THE GAME</h1>
		<input
			bind:value={gameId}
			class="input-md"
			type="text"
			name="gameId"
			id="gameId"
			placeholder="Game name"
		/>
		<input
			bind:value={player}
			class="input-md"
			type="text"
			name="player"
			id="player"
			placeholder="Player name"
		/>
		<button class="btn" disabled={createDisabled} on:click={createGame}>Create game</button>
		<button class="btn" disabled={playerDisabled || createDisabled} on:click={joinGame}
			>Join game</button
		>
	{:else if role === 'admin'}
		<p>you be an admin now :)</p>
		<button class="btn" on:click={printGame}>Print game</button>
		<button class="btn" on:click={client.startGame}>Start game</button>
		<button class="btn" on:click={client.resetBuzzer}>Reset buzzers</button>
		<div class="flex flex-col gap-2">
			{#if pointList}
				<div class="overflow-x-auto">
					<table class="table w-full">
						<!-- head -->
						<thead>
							<tr>
								<th />
								<th>Player</th>
								<th>Points</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each pointList as playerPoints, index}
								<tr>
									<th>{index + 1}</th>
									<td>{playerPoints.player}</td>
									<td>{playerPoints.points}</td>
									<td>
										<button
											class="btn btn-sm"
											on:click={() => client.addPoints(playerPoints.player, 1)}>Add point</button
										>
										<button
											class="btn btn-sm"
											on:click={() => client.deductPoints(playerPoints.player, 1)}
											>Deduct point</button
										>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{:else if role === 'player'}
		<p>player you are :)</p>
		<button class="btn" on:click={printGame}>Print game</button>
		<button class="btn" on:click={client.buzz}>BUZZ!</button>
	{:else}
		<p>it borked</p>
	{/if}
</div>
