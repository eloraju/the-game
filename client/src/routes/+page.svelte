<script lang="ts">
	import { client, gameData, currentGame } from '$lib/stores/socketStore';
	import buzz from '$lib/assets/buzzer.wav';
	import { GameState, type UpdateForUI } from 'server/src/types/types';
	import { onMount } from 'svelte';

	let role: string;
	let game: UpdateForUI;
	let buzzAudio: HTMLAudioElement;

	gameData.subscribe((g) => (game = g));

	client.onRoleReceived((r) => (role = r));

	onMount(() => {
		buzzAudio = new Audio(buzz);
	});

	function buzzer() {
		client.buzz();
		buzzAudio.play();
	}

	function createGame() {
		client.createGame(gameId);
	}

	function joinGame() {
		client.joinGame(gameId, player);
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
		{#if game.state == GameState.LOBBY}
			<button class="btn" on:click={client.startGame}>Start game</button>
		{/if}
		<button class="btn" on:click={client.resetBuzzers}>Reset buzzers</button>
		<button class="btn btn-error" on:click={client.endGame}>End game</button>
		<div class="flex flex-row gap-2 items-stretch">
			<div class="overflow-x-auto">
				<table class="table flex-1">
					<thead>
						<tr>
							<th />
							<th>Player</th>
							<th>Points</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#if game && game.points && game.points.length > 0}
							{#each game.points as playerPoints, index}
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
						{/if}
					</tbody>
				</table>
			</div>
			<div class="overflow-x-auto">
				<table class="table">
					<thead>
						<tr>
							<th />
							<th>Buzzers</th>
						</tr>
					</thead>
					<tbody>
						{#if game.buzzList && game.buzzList.length > 0}
							{#each game.buzzList as player, index}
								<tr>
									<th>{index + 1}</th>
									<td>{player}</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	{:else if role === 'player'}
		{#if game.state == GameState.ENDED}
			<p>Game ended! Winner: {game.points.at(0)?.player}</p>
		{:else}
			<p>Points: {game.points.find((p) => p.player === currentGame.player)?.points}</p>
			{#if game.state == GameState.ACCEPTING_BUZZEZ}
				<button class="btn btn-circle btn-error btn-lg w-80 h-80" on:click={buzzer}>BUZZ!</button>
			{:else if game.state == GameState.LOBBY}
				<h1>Waiting for the game to start</h1>
			{:else}
				<h1 class="text-lg font-bold">
					{game.buzzList.includes(currentGame.player)
						? "You're up!"
						: `Too slow! ${game.buzzList.at(0)} has the floor!`}
				</h1>
			{/if}
		{/if}
	{:else}
		<p>it borked</p>
	{/if}
</div>
